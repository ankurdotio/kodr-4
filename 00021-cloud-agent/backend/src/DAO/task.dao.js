import Task from '../models/task.model.js';

export async function createTask(input) {
  return (await Task.create(input)).toObject();
}

export async function findOwnedTask(id, owner) {
  return Task.findOne({ _id: id, owner }).lean();
}

export async function listUnfinishedTasks() {
  return Task.find({ cleanupPending: true }).sort({ createdAt: 1 }).lean();
}

export async function updateTask(id, fields) {
  return Task.findByIdAndUpdate(id, { $set: fields }, { new: true }).lean();
}
