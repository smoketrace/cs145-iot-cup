// DENO-TWILIO integration

import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import {
 Observable,
 from,
 timer,
} from 'https://cdn.skypack.dev/rxjs';
import {
 flatMap,
 distinct,
 takeWhile,
 takeUntil,
} from 'https://cdn.skypack.dev/rxjs/operators';


// The code below defines and exports the SMSRequest interface
export interface SMSRequest {
 [index: string]: string;
 From: string;
 To: string;
 Body: string;
}

// This class will be the helper that can be used outside of  
// this file to send SMS requests through the Twilio API.
export class TwilioSMS {
  private authorizationHeader: string;
  
  // constructer takes 3 parameters
  // accountSID – unique identifier of a Twilio account
  // keySID – unique identifier of an API key
  // secret – key secret value
  constructor(private accountSID: string, keySID: string, secret: string) {
      this.authorizationHeader = 'Basic ' + base64.fromUint8Array(new TextEncoder().encode(keySID + ':' + secret));
  }

  // This is the async function responsible for 
  // sending SMS requests to the Twilio API.
  // The body of the function performs an HTTP POST request to the
  // https://api.twilio.com/2010-04-01/Accounts/YOUR_ACC_SID/Messages.json 
  // URI to place the send SMS request, with the YOUR_ACC_SID placeholder 
  // replaced with your actual Account SID.
  private postSMSRequest(payload: SMSRequest): Promise<string> {
    const request = fetch(
      'https://api.twilio.com/2010-04-01/Accounts/' +
        this.accountSID + // replace this.accountSID with account SID later
        '/Messages.json',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded;charset=UTF-8',
          Authorization: this.authorizationHeader,
        },
        body: new URLSearchParams(payload).toString(),
      }
    ).then((resp) => resp.json());
 
    const uri = request.then((resp) => {
      if (resp.status != 'queued') {
        return Promise.reject(resp.message);
      }
      return resp.uri;
    });
    return uri;
  }
  
  // The URI returned by the postSMSRequest can be used to poll 
  // the status of the request, made to the Twilio API. The function
  // which covers this functionality will return an Observable.
  private pollRequestStatus(
    uri: string
  ): Observable<string> {
    const timeout = timer(10 * 1000);
    return timer(0, 500).pipe(

      flatMap(() => {
        return from(
          fetch('https://api.twilio.com' + uri, {
            headers: {
              Authorization: this.authorizationHeader,
            },
          })
            .then((resp) => resp.json())
            .then((resp) => resp.status)
        );
      }),

      distinct(),

      takeWhile(
        (status: string) =>
          !['delivered', 'undelivered'].includes(status),
        true
      ),

      takeUntil(timeout)
    );
  }

  
  public sendSms(payload: SMSRequest): Observable<string> {
    return from(
      this.postSMSRequest(
        payload)
     
    ).pipe(
      flatMap((uri: string) => this.pollRequestStatus(uri))
    );
  }
}
