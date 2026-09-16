import { CommunityQuestion } from '../models/CommunityQuestion.js';
import { CommunityAnswer } from '../models/CommunityAnswer.js';
import { notify } from '../utils/notify.js';

const AUTHOR_FIELDS = 'name username avatar';

export async function listQuestions(req, res) {
  try {
    const { sort = 'newest' } = req.query;

    const sortMap = {
      newest: { createdAt: -1 },
      liked: { likes: -1, createdAt: -1 },
    };

    const questions = await CommunityQuestion.find()
      .populate('author', AUTHOR_FIELDS)
      .sort(sortMap[sort] || sortMap.newest)
      .limit(50);

    res.json(
      questions.map((q) => ({
        id: q._id,
        title: q.title,
        description: q.description,
        language: q.language,
        category: q.category,
        tags: q.tags,
        author: q.author,
        likeCount: q.likes.length,
        answerCount: q.answerCount,
        createdAt: q.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Could not load community questions. Please try again.' });
  }
}

export async function createQuestion(req, res) {
  try {
    const { title, description, language, category, tags } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'A title and description are required.' });
    }

    const question = await CommunityQuestion.create({
      author: req.user.id,
      title: title.trim(),
      description: description.trim(),
      language: language || '',
      category: category || '',
      tags: Array.isArray(tags) ? tags.slice(0, 6) : [],
    });

    res.status(201).json({ id: question._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not publish your question. Please try again.' });
  }
}

export async function getQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const { sort = 'newest' } = req.query;

    const question = await CommunityQuestion.findById(questionId).populate('author', AUTHOR_FIELDS);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const sortMap = {
      newest: { createdAt: -1 },
      best: { upvotes: -1, createdAt: -1 },
    };

    const answers = await CommunityAnswer.find({ question: questionId })
      .populate('author', AUTHOR_FIELDS)
      .sort(sortMap[sort] || sortMap.newest);

    res.json({
      id: question._id,
      title: question.title,
      description: question.description,
      language: question.language,
      category: question.category,
      tags: question.tags,
      author: question.author,
      likeCount: question.likes.length,
      likedByMe: question.likes.some((id) => id.toString() === req.user.id),
      createdAt: question.createdAt,
      answers: answers.map((a) => ({
        id: a._id,
        body: a.body,
        author: a.author,
        upvoteCount: a.upvotes.length,
        upvotedByMe: a.upvotes.some((id) => id.toString() === req.user.id),
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load this question. Please try again.' });
  }
}

export async function toggleLikeQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const question = await CommunityQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const alreadyLiked = question.likes.some((id) => id.toString() === req.user.id);

    if (alreadyLiked) {
      question.likes = question.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      question.likes.push(req.user.id);
      if (question.author.toString() !== req.user.id) {
        await notify({
          recipient: question.author,
          actor: req.user.id,
          type: 'like',
          message: `${req.user.name} liked your question.`,
          link: `/community/${question._id}`,
        });
      }
    }

    await question.save();
    res.json({ likeCount: question.likes.length, likedByMe: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Could not update your like. Please try again.' });
  }
}

export async function createAnswer(req, res) {
  try {
    const { questionId } = req.params;
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: 'Your answer cannot be empty.' });

    const question = await CommunityQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const answer = await CommunityAnswer.create({
      question: questionId,
      author: req.user.id,
      body: body.trim(),
    });

    question.answerCount += 1;
    await question.save();

    if (question.author.toString() !== req.user.id) {
      await notify({
        recipient: question.author,
        actor: req.user.id,
        type: 'new_answer',
        message: `${req.user.name} answered your question.`,
        link: `/community/${questionId}`,
      });
    }

    res.status(201).json({ id: answer._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not post your answer. Please try again.' });
  }
}

export async function toggleUpvoteAnswer(req, res) {
  try {
    const { answerId } = req.params;
    const answer = await CommunityAnswer.findById(answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    const alreadyUpvoted = answer.upvotes.some((id) => id.toString() === req.user.id);
    if (alreadyUpvoted) {
      answer.upvotes = answer.upvotes.filter((id) => id.toString() !== req.user.id);
    } else {
      answer.upvotes.push(req.user.id);
    }

    await answer.save();
    res.json({ upvoteCount: answer.upvotes.length, upvotedByMe: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Could not update your upvote. Please try again.' });
  }
}
