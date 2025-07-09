import * as borsh from "@coral-xyz/borsh";
import BN from "bn.js";

// Define your message types to match the Rust enum
export type BetlifyMessage =
  | { variant: 0; question: string; options: string[]; pool_id: BN; start_time: BN; lock_time: BN; end_time: BN }
  | { variant: 1; pool_id: BN; option: number; amount: BN }
  | { variant: 2; pool_id: BN; winning_option: number }
  | { variant: 3; pool_id: BN };

// Create Borsh schemas for each variant
const createPoolSchema = borsh.struct([
  borsh.u8("variant"),
  borsh.str("question"),
  borsh.vec(borsh.str(), "options"),
  borsh.u64("pool_id"),
  borsh.i64("start_time"),
  borsh.i64("lock_time"),
  borsh.i64("end_time"),
]);

const placeBetSchema = borsh.struct([
  borsh.u8("variant"),
  borsh.u64("pool_id"),
  borsh.u8("option"),
  borsh.u64("amount"),
]);

const resolveMarketSchema = borsh.struct([
  borsh.u8("variant"),
  borsh.u64("pool_id"),
  borsh.u8("winning_option"),
]);

const claimWinningsSchema = borsh.struct([
  borsh.u8("variant"),
  borsh.u64("pool_id"),
]);

// Helper function to convert BN to number for u64/i64 fields
function bnToNumber(bn: BN): BN {
  return bn;
}

// Encode a message using Borsh
export function encodeBetlifyMessage(message: BetlifyMessage): Buffer {
  let schema: any;
  let data: any;
  
  switch (message.variant) {
    case 0: // CreatePool
      schema = createPoolSchema;
      data = {
        variant: 0,
        question: message.question,
        options: message.options,
        pool_id: message.pool_id,
        start_time: message.start_time,
        lock_time: message.lock_time,
        end_time: message.end_time,
      };
      break;
      
    case 1: // PlaceBet
      schema = placeBetSchema;
      data = {
        variant: 1,
        pool_id: message.pool_id,
        option: message.option,
        amount: message.amount,
      };
      break;
      
    case 2: // ResolveMarket
      schema = resolveMarketSchema;
      data = {
        variant: 2,
        pool_id: message.pool_id,
        winning_option: message.winning_option,
      };
      break;
      
    case 3: // ClaimWinnings
      schema = claimWinningsSchema;
      data = {
        variant: 3,
        pool_id: message.pool_id,
      };
      break;
      
    default:
      throw new Error(`Unknown variant`);
  }
  
  // Allocate buffer and encode
  const buffer = Buffer.alloc(1000); // Allocate generous buffer
  schema.encode(data, buffer);
  return buffer.subarray(0, schema.getSpan(buffer));
}