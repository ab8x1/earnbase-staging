import { Document, Schema, models, model } from 'mongoose';

export interface Pools extends Document {
  poolId: string;
  network: string;
  vault: string;
  platform: string;
  productName: string;
  productLink: string;
  spotApy: number;
  weeklyApy: number;
  monthlyApy: number;
  lifeTimeApy: number;
  operatingSince: number;
  tvl: number;
  sponsored: boolean;
}

const PoolSchema = new Schema<Pools>({
  poolId: { type: String, required: true },
  network: { type: String, required: true },
  vault: { type: String, required: true },
  platform: { type: String, required: true },
  productName: { type: String, required: true },
  productLink: { type: String, required: true },
  spotApy: { type: Number, required: true },
  weeklyApy: { type: Number, required: true },
  monthlyApy: { type: Number, required: true },
  lifeTimeApy: { type: Number, required: true },
  operatingSince: { type: Number, required: true },
  tvl: { type: Number, required: true },
  sponsored: { type: Boolean },
});

export default models.Pool || model<Pools>('Pool', PoolSchema);
