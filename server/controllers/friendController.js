import { FriendRequest } from '../models/FriendRequest.js';
import { User } from '../models/User.js';
import { notify } from '../utils/notify.js';
import { isUserOnline } from '../sockets/index.js';

const PUBLIC_FIELDS =
  'name username avatar country nativeLanguages learningLanguages interests bio';

export async function sendFriendRequest(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing user to send a request to.' });
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You can't send yourself a friend request." });
    }

    const recipient = await User.findById(userId);
    if (!recipient) return res.status(404).json({ message: 'User not found.' });

    if (req.user.friends.some((f) => f.toString() === userId)) {
      return res.status(400).json({ message: 'You are already friends with this person.' });
    }

    // If they already sent us one, accept it instead of creating a duplicate.
    const reverse = await FriendRequest.findOne({
      sender: userId,
      recipient: req.user.id,
      status: 'pending',
    });
    if (reverse) {
      return res.status(400).json({ message: 'This person already sent you a request — check your requests list.' });
    }

    const existing = await FriendRequest.findOne({ sender: req.user.id, recipient: userId });
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'You already sent a request to this person.' });
      }
      existing.status = 'pending';
      await existing.save();
    } else {
      await FriendRequest.create({ sender: req.user.id, recipient: userId });
    }

    await notify({
      recipient: userId,
      actor: req.user.id,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request.`,
      link: '/friends',
    });

    res.status(201).json({ message: 'Friend request sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send the friend request. Please try again.' });
  }
}

export async function respondToFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' | 'reject'

    const request = await FriendRequest.findById(requestId);
    if (!request || request.recipient.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been handled.' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
      await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

      await notify({
        recipient: request.sender,
        actor: req.user.id,
        type: 'friend_request_accepted',
        message: `${req.user.name} accepted your friend request.`,
        link: '/friends',
      });

      return res.json({ message: 'Friend request accepted.' });
    }

    if (action === 'reject') {
      request.status = 'rejected';
      await request.save();
      return res.json({ message: 'Friend request declined.' });
    }

    res.status(400).json({ message: "Action must be 'accept' or 'reject'." });
  } catch (error) {
    res.status(500).json({ message: 'Could not update that request. Please try again.' });
  }
}

export async function cancelFriendRequest(req, res) {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findById(requestId);
    if (!request || request.sender.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }
    await request.deleteOne();
    res.json({ message: 'Friend request cancelled.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not cancel that request. Please try again.' });
  }
}

export async function removeFriend(req, res) {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { friends: req.user.id } });
    res.json({ message: 'Removed from your friends.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not remove that friend. Please try again.' });
  }
}

export async function listFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('friends', PUBLIC_FIELDS);

    const friends = user.friends.map((f) => ({
      id: f._id,
      name: f.name,
      username: f.username,
      avatar: f.avatar,
      country: f.country,
      nativeLanguages: f.nativeLanguages,
      learningLanguages: f.learningLanguages,
      online: isUserOnline(f._id.toString()),
    }));

    const incoming = await FriendRequest.find({ recipient: req.user.id, status: 'pending' }).populate(
      'sender',
      PUBLIC_FIELDS
    );
    const outgoing = await FriendRequest.find({ sender: req.user.id, status: 'pending' }).populate(
      'recipient',
      PUBLIC_FIELDS
    );

    res.json({
      friends,
      incomingRequests: incoming.map((r) => ({ id: r._id, from: r.sender, createdAt: r.createdAt })),
      outgoingRequests: outgoing.map((r) => ({ id: r._id, to: r.recipient, createdAt: r.createdAt })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load your friends. Please try again.' });
  }
}
