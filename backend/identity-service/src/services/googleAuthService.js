// Xác thực Authorization Code từ Google và tạo/tìm user tương ứng
const { OAuth2Client } = require('google-auth-library');
const { withTransaction } = require('../config/db');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const { issueTokens } = require('./tokenService');
const HttpError = require('../utils/HttpError');
const config = require('../config');

const oauthClient = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
);

// Đổi Authorization Code lấy thông tin profile từ Google
async function getGoogleProfile(code) {
    try {
        const { tokens } = await oauthClient.getToken(code);
        const ticket = await oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.google.clientId,
        });
        const payload = ticket.getPayload();
        return {
            googleId: payload.sub,          // ID duy nhất của Google
            email: payload.email,
            fullName: payload.name,
            picture: payload.picture,
        };
    } catch {
        throw new HttpError(400, 'Mã xác thực Google không hợp lệ hoặc đã hết hạn');
    }
}

// Tạo userName tự động từ email (vd: nguyenvana@gmail.com → nguyenvana)
function deriveUserName(email) {
    return email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
}

// Đăng nhập / đăng ký bằng Google: trả về cặp token như login thường
async function loginWithGoogle({ code, ipAddress }) {
    if (!code) throw new HttpError(400, 'Thiếu authorization code từ Google');

    const { googleId, email, fullName } = await getGoogleProfile(code);

    // issueTokens dùng pool riêng → phải gọi NGOÀI withTransaction để tránh deadlock
    let resolvedUser, resolvedRoles;

    await withTransaction(async (conn) => {
        // 1. Tìm user đã liên kết GoogleId
        let user = await userModel.findByGoogleId(googleId, conn);

        // 2. Nếu chưa có, tìm theo email (tài khoản đã đăng ký thường)
        if (!user) {
            const existing = await userModel.findByUserNameOrEmail('', email.toLowerCase(), conn);
            if (existing) {
                await userModel.linkGoogleId(existing.Id, googleId, conn);
                user = { ...existing, GoogleId: googleId };
            }
        }

        // 3. Tài khoản hoàn toàn mới → tạo mới
        if (!user) {
            let userName = deriveUserName(email);
            const existing = await userModel.findByUserNameOrEmail(userName, '', conn);
            if (existing) userName = `${userName}_${Date.now().toString().slice(-4)}`;

            const userId = await userModel.createWithGoogle(
                { email: email.toLowerCase(), userName, fullName: fullName || userName, googleId },
                conn
            );
            await roleModel.assignToUser(userId, ['user'], conn);
            user = await userModel.findById(userId, conn);
        }

        if (!user.IsActive) throw new HttpError(403, 'Tài khoản đã bị khóa');

        resolvedUser = user;
        resolvedRoles = await roleModel.findRoleNamesOfUser(user.Id, conn);
    });

    // Gọi issueTokens sau khi transaction đã commit xong
    return issueTokens(resolvedUser, resolvedRoles, ipAddress);
}

module.exports = { loginWithGoogle };