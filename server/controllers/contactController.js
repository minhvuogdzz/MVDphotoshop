import { sendEmail } from '../utils/emailService.js';

export const handleContact = async (req, res) => {
  const { name, phone, email, date, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Vui lòng điền đủ Họ tên, SĐT và Email' });
  }

  const subject = `[MVD Photoshop] Yêu cầu tư vấn mới từ ${name}`;
  const htmlContent = `
    <h2>Có khách hàng mới cần tư vấn:</h2>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <th style="text-align: left;">Họ và tên</th>
        <td>${name}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Số điện thoại</th>
        <td>${phone}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Email</th>
        <td>${email}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Ngày dự kiến</th>
        <td>${date || 'Không có'}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Lời nhắn</th>
        <td>${message || 'Không có'}</td>
      </tr>
    </table>
  `;

  const isSuccess = await sendEmail(subject, htmlContent);

  if (isSuccess) {
    res.json({ success: true, message: 'Đã gửi yêu cầu thành công!' });
  } else {
    res.status(500).json({ error: 'Gửi mail thất bại do cấu hình hệ thống hoặc lỗi mạng.' });
  }
};
