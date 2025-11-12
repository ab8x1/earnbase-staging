import { Document, Schema, models, model } from 'mongoose';

export interface UpdateStatistics extends Document {
  startUpdateFromIndex: number;
  updateAfter: number;
}

const UpdateStatisticSchema = new Schema<UpdateStatistics>({
  startUpdateFromIndex: { type: Number, required: true },
  updateAfter: { type: Number, required: true },
});

export default models.UpdateStatistic ||
  model<UpdateStatistics>('UpdateStatistic', UpdateStatisticSchema);
