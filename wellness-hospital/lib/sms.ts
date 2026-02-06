import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function sendSMS(phone: string, message: string) {
    try {
        const params = {
            Message: message,
            PhoneNumber: phone,
        };
        const command = new PublishCommand(params);
        const response = await snsClient.send(command);
        console.log("SMS sent successfully:", response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error("Error sending SMS:", error);
        return { success: false, error };
    }
}
