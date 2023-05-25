import { Twilio } from "./Twilio.ts";

const accountSID = "AC290780099c336cb223ddcc1b5d9a5363";
const authToken = "72c2996d37d7be8a5039a942a8121877";
const phoneNumber = "+15005550006";

const message = new Twilio(accountSID, authToken, phoneNumber);

// Send the message with the given body
const body = `<device_id> is on RED status. Smoke reading is <smoke_read>.`
message.sendMessage("+639763897508", body);
