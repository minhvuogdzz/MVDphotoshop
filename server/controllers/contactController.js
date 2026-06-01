import nodemailer from 'nodemailer';

export const handleContact = async (req, res) => {
  const { name, phone, email, date, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Vui lòng điền đủ Họ tên, SĐT và Email' });
  }

  // Check if credentials are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing EMAIL_USER or EMAIL_PASS in .env");
    return res.status(500).json({ 
      error: 'Hệ thống gửi mail chưa được thiết lập. Chủ website cần cấu hình EMAIL_USER và EMAIL_PASS trong file .env.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'ougvn.it2@gmail.com', // Destination email
      subject: `[MVD Photoshop] Yêu cầu tư vấn mới từ ${name}`,
      html: `
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
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Đã gửi yêu cầu thành công!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Gửi mail thất bại: ' + error.message });
  }
};
