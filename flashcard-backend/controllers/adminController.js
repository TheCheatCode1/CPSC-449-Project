const User = require('../models/User');
const Set = require('../models/set');
const Card = require('../models/card');
const Quiz = require('../models/Quiz'); // Skip if not implemented

async function findUserByUsername(username) {
  const user = await User.findOne({ username }).lean();
  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
}

exports.getUserData = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'username is required' });

    const user = await findUserByUsername(username);

    // Get sets by user
    const sets = await Set.find({ userId: user._id }).lean();
    const setIds = sets.map(set => set._id);

    // Get cards linked to any of the user's sets
    const cards = await Card.find({ setId: { $in: setIds } }).lean();

    // Get quizzes (optional)
    const quizzes = Quiz?.find
      ? await Quiz.find({ userId: user._id }).lean()
      : [];

    // Count cards per set
    const cardsBySetId = cards.reduce((acc, card) => {
      const sid = card.setId.toString();
      acc[sid] = (acc[sid] || 0) + 1;
      return acc;
    }, {});

    const setsWithCounts = sets.map(set => ({
      ...set,
      cardsCount: cardsBySetId[set._id.toString()] || 0
    }));

    res.json({
      user: { _id: user._id, username: user.username, role: user.role },
      counts: { sets: sets.length, cards: cards.length, quizzes: quizzes.length },
      sets: setsWithCounts,
      cards,
      quizzes
    });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.editById = async (req, res) => {
  try {
    const { username, type, id } = req.params;
    const updates = req.body;
    const io = req.app.get('io'); // ✅ Grab the WebSocket server

    if (!username || !type || !id) {
      return res.status(400).json({ message: 'Missing params' });
    }

    const user = await findUserByUsername(username);

    if (type === 'set') {
      const set = await Set.findOneAndUpdate(
        { _id: id, userId: user._id },
        { $set: { title: updates.title } },
        { new: true }
      );
      if (!set) return res.status(404).json({ message: 'Set not found' });

      io.emit('item-edited', { type: 'set', id, updates }); // ✅ Broadcast
      return res.json({ message: 'Set updated', set });
    }

    if (type === 'card') {
      const sets = await Set.find({ userId: user._id }).lean();
      const setIds = sets.map(s => s._id.toString());
      const card = await Card.findById(id);
      if (!card || !setIds.includes(card.setId.toString())) {
        return res.status(404).json({ message: 'Card not found for user' });
      }

      card.term = updates.term;
      card.definition = updates.definition;
      await card.save();

      io.emit('item-edited', {
        type: 'card',
        id,
        updates: { term: updates.term, definition: updates.definition }
      }); // ✅ Broadcast
      return res.json({ message: 'Card updated', card });
    }

    if (type === 'quiz') {
      const quiz = await Quiz.findOneAndUpdate(
        { _id: id, userId: user._id },
        { $set: { title: updates.title, description: updates.description } },
        { new: true }
      );
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

      io.emit('item-edited', {
        type: 'quiz',
        id,
        updates: { title: updates.title, description: updates.description }
      }); // ✅ Broadcast
      return res.json({ message: 'Quiz updated', quiz });
    }

    res.status(400).json({ message: 'Invalid type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.deleteById = async (req, res) => {
  try {
    const { username, type, id } = req.params;
    const io = req.app.get('io'); // 🔌 Get socket.io instance

    if (!username || !type || !id) {
      return res.status(400).json({ message: 'Missing params' });
    }

    const user = await findUserByUsername(username);

    if (type === 'set') {
      const set = await Set.findOne({ _id: id, userId: user._id });
      if (!set) return res.status(404).json({ message: 'Set not found for user' });

      await Card.deleteMany({ setId: set._id });
      await set.deleteOne();

      // 🔥 Broadcast to all connected users
      io.emit('item-deleted', { type: 'set', id });

      return res.json({ message: 'Set and its cards deleted' });
    }

    if (type === 'card') {
      // Confirm card belongs to one of the user's sets
      const sets = await Set.find({ userId: user._id }).lean();
      const setIds = sets.map(set => set._id.toString());
      const card = await Card.findById(id).lean();

      if (!card || !setIds.includes(card.setId.toString())) {
        return res.status(404).json({ message: 'Card not found for user' });
      }

      await Card.deleteOne({ _id: id });

      // 🔥 Broadcast to all connected users
      io.emit('item-deleted', { type: 'card', id });

      return res.json({ message: 'Card deleted' });
    }

    if (type === 'quiz') {
      if (!Quiz?.findOne) return res.status(400).json({ message: 'Quizzes not implemented' });

      const quiz = await Quiz.findOne({ _id: id, userId: user._id });
      if (!quiz) return res.status(404).json({ message: 'Quiz not found for user' });

      await quiz.deleteOne();

      // 🔥 Broadcast to all connected users
      io.emit('item-deleted', { type: 'quiz', id });

      return res.json({ message: 'Quiz deleted' });
    }

    res.status(400).json({ message: 'Invalid type (must be set|card|quiz)' });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: err.message });
  }
};
