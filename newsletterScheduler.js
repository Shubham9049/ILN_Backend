const cron = require("node-cron");
const Newsletter = require("./models/newsletter");
const sendEmail = require("./utils/sendEmail");

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const newsletters = await Newsletter.find({
      sent: false,
      scheduleAt: { $lte: now },
    });

    for (const newsletter of newsletters) {
      const html = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px; font-family: Arial, sans-serif; border-radius: 8px;">
                <tr>
                  <td align="center">
                    ${
                      newsletter.imageUrl
                        ? `<img src="${newsletter.imageUrl}" alt="Newsletter Image" width="100%" style="margin-bottom: 20px; border-radius: 6px;" />`
                        : ""
                    }
                  </td>
                </tr>
                <tr>
                  <td>
                    <h2 style="color: #333333;">${newsletter.title}</h2>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                      ${newsletter.content}
                    </p>

                    <a href="${
                      newsletter.ctaUrl
                    }" style="display:inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px;">
                      ${newsletter.ctaText}
                    </a>

                    <hr style="margin: 30px 0;" />

                    <p style="font-size: 14px; color: #999999;">
                      If you’d prefer not to receive emails like this, you can <a href="#" style="color: #999;">unsubscribe</a> at any time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

      await sendEmail({
        to: newsletter.emails,
        subject: newsletter.subject,
        text: newsletter.content.replace(/<[^>]+>/g, ""),
        html,
      });

      newsletter.sent = true;
      newsletter.sentAt = new Date();
      await newsletter.save();

      console.log(`✅ Sent scheduled newsletter: ${newsletter._id}`);
    }
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
});
