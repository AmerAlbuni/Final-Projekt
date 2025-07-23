import mongoose from 'mongoose';
import Task from './Task.js'; // ✅ Needed for cascading delete

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    deadline: Date,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Cascading delete middleware: removes all related tasks when a project is deleted via `deleteOne()`
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    if (!this._id) {
      console.warn('⚠️ No project ID found in deleteOne hook.');
      return next();
    }

    const result = await Task.deleteMany({ project: this._id });
    console.log(`🗑️ Deleted ${result.deletedCount} tasks for project ${this._id}`);
    next();
  } catch (err) {
    console.error('❌ Error during cascading task delete:', err.message);
    next(err);
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
