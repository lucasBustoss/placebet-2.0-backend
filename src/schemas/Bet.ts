import mongoose from 'mongoose';

interface Bets extends mongoose.Document {
  eventId: string;
  marketId: string;
  eventDescription: string;
  marketDesc: string;
  date: string;
  startTime: string;
  method: string;
  profitLoss: number;
}

const BetsSchema = new mongoose.Schema(
  {
    eventId: {
      type: Number,
      required: true,
    },
    marketId: {
      type: String,
      required: true,
    },
    eventDescription: {
      type: String,
      required: true,
    },
    marketDesc: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    profitLoss: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<Bets>('Bet', BetsSchema);
