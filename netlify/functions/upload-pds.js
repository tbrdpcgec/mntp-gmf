export async function handler(event) {
    try {
      const GOOGLE_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbzT2uuXwSp0SzJDHAuMCdi8_3llGfNrSDolxxpokbFxLk8FH9jekn6BACozw8JK9l7m/exec';
  
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: event.body,
      });
  
      const text = await response.text();
  
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: text,
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: err.message,
        }),
      };
    }
  }