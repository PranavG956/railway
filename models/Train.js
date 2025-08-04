    import mongoose from 'mongoose';

    const trainSchema = new mongoose.Schema({
      name: { type: String, required: true },
      number: { type: String, required: true, unique: true },
      source: { type: String, required: true },
      destination: { type: String, required: true },
      departure: { type: String, required: true },
      arrival: { type: String, required: true },
      availableSeats: { type: Number, required: true, default: 0 },
      fare: { type: Number, required: true, default: '0' },
    });

    const Train = mongoose.models.Train || mongoose.model('Train', trainSchema);
    export default Train;
    