use anchor_lang::prelude::error_code;
use std::str;
use anchor_lang::prelude::*;

// -----------------------------------------------------------------------------
// This file defines how the example program encodes and decodes its messages.
// Each OApp can implement its own layout as long as the sending and receiving
// chains agree.  Here we simply prefix a UTF-8 string with a 32 byte length
// header. In this example, the EVM-side equivalant is in `contracts/libs/StringMsgCodec.sol`
// -----------------------------------------------------------------------------


// The message is a UTF-8 encoded string prefixed with a 32 byte header.
// The following is the layout of the message:
// Offset →
// 0                     28     32                     32+N
// |---------------------|------|---------------------------->
// |     28 bytes        | 4B   |     N bytes                |
// |    zero padding     | len  | UTF-8 encoded string       |
// |---------------------|------|----------------------------|


// We prefix the encoded string with a 32 byte length header.
pub const LENGTH_OFFSET: usize = 0;
pub const STRING_OFFSET: usize = 32;

#[error_code]
pub enum MsgCodecError {
    /// Buffer too short to even contain the 32‐byte length header
    InvalidLength,
    /// Header says "string is N bytes" but buffer < 32+N
    BodyTooShort,
    /// Payload bytes aren't valid UTF-8
    InvalidUtf8,
}

// Encode a UTF-8 string into a message format with a 32 byte header
pub fn encode(string: &str) -> Vec<u8> {
    let string_bytes = string.as_bytes();
    let mut msg = Vec::with_capacity(
        STRING_OFFSET +               // header length
        string_bytes.len()            // string bytes
    );

    // 4 byte length stored at the end of the 32 byte header
    msg.extend(std::iter::repeat(0).take(28)); // padding
    msg.extend_from_slice(&(string_bytes.len() as u32).to_be_bytes());

    // string
    msg.extend_from_slice(string_bytes);

    msg
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BetlifyMessage {
    CreatePool {
        question: String,
        options: Vec<String>,
        pool_id: u64,
        start_time: i64,
        lock_time: i64,
        end_time: i64,
    },
    PlaceBet {
        pool_id: u64,
        option: u8,
        amount: u64,
    },
    ResolveMarket {
        pool_id: u64,
        winning_option: u8,
    },
    ClaimWinnings {
        pool_id: u64,
    },
}

pub fn encode_betlify_message(msg: &BetlifyMessage) -> Vec<u8> {
    let mut data = vec![];
    msg.serialize(&mut data).unwrap();
    data
}

pub fn decode_betlify_message(data: &[u8]) -> std::result::Result<BetlifyMessage, MsgCodecError> {
    BetlifyMessage::try_from_slice(data).map_err(|_| MsgCodecError::InvalidUtf8)
}
