import { ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export interface CommentData {
  postId: string;
  authorId: string;
  content: string;
}

// Get comments for a post with pagination
export async function getComments(
  postId: string,
  limit: number = 10,
  offset: number = 0,
  sortBy: 'createdAt' | 'upvotes' = 'createdAt'
) {
  try {
    const sortOption: { [key: string]: 1 | -1 } = 
      sortBy === 'upvotes' ? { upvotes: -1 } : { createdAt: -1 };

    // Comment-only: fetch all comments for the post (no nesting)
    const comments = await ForumCommentModel.find({
      postId: new Types.ObjectId(postId)
    })
      .sort(sortOption)
      .limit(limit)
      .skip(offset)
      .populate('authorId', 'firstName lastName role profilePicture')
      .lean();

    const total = await ForumCommentModel.countDocuments({
      postId: new Types.ObjectId(postId)
    });

    return {
      comments,
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

// Create a new comment
export async function createComment(commentData: CommentData) {
  try {
    const { postId, authorId, content } = commentData;

    // Create the comment
    const comment = await ForumCommentModel.create({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(authorId),
      content,
      upvotes: []
    });

    // Populate author information
    await comment.populate('authorId', 'firstName lastName role profilePicture');

    return comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Update a comment
export async function updateComment(
  commentId: string,
  authorId: string,
  content: string
) {
  try {
    const comment = await ForumCommentModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(commentId),
        authorId: new Types.ObjectId(authorId)
      },
      { content },
      { new: true }
    ).populate('authorId', 'firstName lastName role profilePicture');

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    return comment;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(commentId: string, authorId: string) {
  try {
    // Check if the comment exists and belongs to the user
    const comment = await ForumCommentModel.findOne({
      _id: new Types.ObjectId(commentId),
      authorId: new Types.ObjectId(authorId)
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    // Comment-only system: hard delete without parent/replies adjustments
    await ForumCommentModel.findByIdAndDelete(commentId);

    return { success: true, deleted: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Upvote a comment
export async function upvoteComment(commentId: string, userId: string) {
  try {
    const comment = await ForumCommentModel.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user has already upvoted
    const hasUpvoted = comment.upvotes.some(
      id => (id as Types.ObjectId).toString() === userId
    );

    if (hasUpvoted) {
      // Remove upvote
      comment.upvotes = comment.upvotes.filter(
        (id: Types.ObjectId) => id.toString() !== userId
      );
    } else {
      // Add upvote
      comment.upvotes.push(new Types.ObjectId(userId));
    }

    await comment.save();

    return {
      success: true,
      upvoted: !hasUpvoted,
      upvoteCount: comment.upvotes.length
    };
  } catch (error) {
    console.error('Error upvoting comment:', error);
    throw error;
  }
}

// Verify a comment as a helpful answer (researcher only)
export async function verifyCommentAsAnswer(commentId: string, researcherId: string) {
  try {
    // Find the comment
    const comment = await ForumCommentModel.findById(commentId).populate('authorId');
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Check if the researcher is verifying their own comment
    if (comment.authorId._id.toString() === researcherId) {
      throw new Error('Researchers cannot verify their own comments');
    }
    
    // Update the comment
    comment.isVerifiedAnswer = true;
    await comment.save();
    
    // Update the researcher's verified answer count
    const { default: UserModel } = await import('@/models/user/User');
    await UserModel.findByIdAndUpdate(
      comment.authorId._id,
      { $inc: { verifiedAnswerCount: 1 } }
    );
    
    return {
      success: true,
      isVerifiedAnswer: true
    };
  } catch (error) {
    console.error('Error verifying comment:', error);
    throw error;
  }
}

// Search for users to mention
export async function searchUsersForMention() {
  try {
    // This would typically search for users in your database
    // For now, we'll return a mock implementation
    // In a real app, you would search your User collection
    return [
      { id: '1', firstName: 'John', lastName: 'Doe', profilePicture: '' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', profilePicture: '' },
      { id: '3', firstName: 'Bob', lastName: 'Johnson', profilePicture: '' }
    ];
  } catch (error) {
    console.error('Error searching users for mention:', error);
    throw error;
  }
}
