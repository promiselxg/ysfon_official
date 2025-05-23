import { removeUploadedImage } from "@/lib/utils/cloudinary";
import { customMessage, ServerError } from "@/lib/utils/customMessage";
import prisma from "@/lib/utils/dbConnect";
import { isValidUUID } from "@/lib/utils/validateUUID";
import sanitize from "sanitize-html";

const createNewCourse = async (req) => {
  try {
    const { title, userId } = await req.json();
    if (!title) {
      return customMessage("Course Title is required", {}, 400);
    }

    if (!userId) {
      return customMessage("User ID is required", {}, 400);
    }

    if (typeof title !== "string") {
      return customMessage("Course title must be a string", {}, 400);
    }

    if (!isValidUUID(userId)) {
      return customMessage("Invalid user ID", {}, 400);
    }

    const sanitizedName = sanitize(title);

    const courseTitleExist = await prisma.course.findFirst({
      where: { title: sanitizedName },
    });

    if (courseTitleExist) {
      return customMessage("Course title  already exists", {}, 409);
    }

    if (!(await prisma.user.findUnique({ where: { id: userId } }))) {
      return customMessage("User does not exist", {}, 404);
    }

    const course = await prisma.course.create({
      data: { title: sanitizedName, userId },
    });

    return customMessage(
      "Course created successfully",
      {
        course: { id: course.id, title: course.title, userId: course.userId },
      },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const createCourseCategory = async (req) => {
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Course category name is required", {}, 400);
    }

    if (typeof name !== "string") {
      return customMessage("Category title must be a string", {}, 400);
    }

    const nameExist = await prisma.courseCategory.findFirst({
      where: { name },
    });

    if (nameExist) {
      return customMessage("Course category already exists", {}, 409);
    }

    const category = await prisma.courseCategory.create({
      data: { name },
    });

    return customMessage(
      "Course category created successfully",
      { category },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const createCourseChapter = async (req, params) => {
  try {
    const { id } = await params;
    const userId = req.user.id;

    const { title } = await req.json();

    if (!id) {
      return customMessage("Course ID is required", {}, 400);
    }

    if (!title) {
      return customMessage("Chapter title is required", {}, 400);
    }

    if (typeof title !== "string") {
      return customMessage("Chapter title must be a string", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid Course ID", {}, 400);
    }
    if (
      await prisma.chapter.findFirst({
        where: { title },
      })
    ) {
      return customMessage("Chapter title already exist.", {}, 400);
    }

    const courseExist = await prisma.course.findUnique({
      where: { id },
    });

    if (!courseExist) {
      return customMessage("Course not found", {}, 404);
    }

    if (courseExist.userId !== userId) {
      return customMessage(
        "Unauthorized: you do not have the required permission to perform this action",
        {},
        401
      );
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: {
        courseId: id,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const sanitizedTitle = sanitize(title);

    const chapter = await prisma.chapter.create({
      data: {
        title: sanitizedTitle,
        position: newPosition,
        courseId: id,
      },
    });

    return customMessage(
      "Course chapter created successfully",
      { chapter },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCategory = async (req, params) => {
  const { id } = await params;
  if (!id) {
    return customMessage("Course category ID is required", {}, 400);
  }
  try {
    const { name } = await req.json();
    if (!name) {
      return customMessage("Course category name is required", {}, 400);
    }

    if (typeof name !== "string") {
      return customMessage("Course category name must be a string", {}, 400);
    }

    const category = await prisma.courseCategory.update({
      where: { id },
      data: { name },
    });
    return customMessage(
      "Course category updated successfully",
      { category },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const enrollInCourse = async (req, params) => {
  const { courseId } = await params;

  const userId = req.user.id;

  if (!courseId) {
    return customMessage("Course ID is required", {}, 400);
  }

  if (!userId) {
    return customMessage("User ID is required", {}, 400);
  }

  if (!isValidUUID(courseId) || !isValidUUID(userId)) {
    return customMessage("Invalid Course ID or User ID", {}, 400);
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!course) {
      return customMessage("Course not found", {}, 404);
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (purchase) {
      return customMessage("Already enrolled in this course", {}, 409);
    }

    await prisma.purchase.create({
      data: {
        userId,
        courseId,
      },
    });

    return customMessage(
      "Enrolled in course successfully",
      { chapterId: course.chapters[0].id },
      201
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCourse = async (req, params) => {
  try {
    const { id } = await params;
    const updates = await req.json();

    if (!id) {
      return customMessage("Course ID is required", {}, 400);
    }

    if (!isValidUUID(id)) {
      return customMessage("Invalid Course ID", {}, 400);
    }
    const courseExist = await prisma.course.findUnique({
      where: { id, userId: req.user.id },
    });

    if (!courseExist) {
      return customMessage("Unauthorized", {}, 401);
    }

    // Ensure updates contain at least one valid field
    if (Object.keys(updates).length === 0 || updates === null) {
      return customMessage("No update fields provided", {}, 400);
    }

    // Validate price if included
    if (updates.price !== undefined) {
      const numericPrice = Number(updates.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return customMessage("Invalid price value", {}, 400);
      }
      updates.price = numericPrice;
    }

    // Validate category if included
    if (updates.categoryId) {
      const categoryExists = await prisma.courseCategory.findUnique({
        where: { id: updates.categoryId },
      });

      if (!categoryExists) {
        return customMessage("Course Category does not exist", {}, 400);
      }

      updates.category = {
        connect: { id: updates.categoryId },
      };
      delete updates.categoryId;
    }

    if (updates.title) {
      updates.title = sanitize(updates.title);
    }
    if (updates.description) {
      updates.description = sanitize(updates.description);
    }

    // Handle images update (expects an array of image objects)
    if (updates.photos) {
      if (!Array.isArray(updates.photos)) {
        return customMessage("Images must be an array of objects", {}, 400);
      }

      const validImages = updates.photos.every(
        (img) => img.public_id && img.secure_url
      );

      if (!validImages) {
        return customMessage(
          "Each image must have a valid publicId and public_url",
          {},
          400
        );
      }
      // Delete old asset.
      if (courseExist?.asset?.assetId) {
        await removeUploadedImage(
          [courseExist.asset],
          courseExist.asset.resourceType
        );
      }

      updates.asset = {
        assetId: updates.photos[0].public_id,
        publicUrl: updates.photos[0].secure_url,
        publicId: updates.photos[0].public_id,
        format: updates.photos[0].format,
        resourceType: updates.photos[0].resource_type,
        originalFilename: updates.photos[0].original_filename,
      };
      delete updates.photos;
    }

    await prisma.course.update({
      where: { id },
      data: updates,
    });

    return customMessage("Course updated successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const publishCourse = async (req, params) => {
  const { id: courseId } = await params;
  const userId = req.user.id;

  try {
    if (!userId) {
      return customMessage("Unauthorized", {}, 401);
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });
    if (!course) {
      return customMessage("course not found", {}, 404);
    }

    const hasPublishedChapter = course.chapters.some(
      (chapter) => chapter.isPublished
    );

    if (
      !course.title ||
      !course.description ||
      !course.categoryId ||
      !hasPublishedChapter
    ) {
      return customMessage("Missing required fields", {}, 401);
    }

    if (
      course &&
      course.mediaType &&
      course.mediaType.toLowerCase() === "video"
    ) {
      if (!course.videoUrl) {
        return customMessage("Missing required fields", {}, 401);
      }
    }
    const publishedCourse = await prisma.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: true,
      },
    });

    return customMessage(
      "Course published successfully",
      { publishedCourse },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const unpublishCourse = async (req, params) => {
  const { id: courseId } = await params;
  const userId = req.user.id;

  try {
    if (!userId) {
      return customMessage("Unauthorized", {}, 401);
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });
    if (!course) {
      return customMessage("course not found", {}, 404);
    }

    const unpublishedCourse = await prisma.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });

    return customMessage(
      "Course unpublished successfully",
      { unpublishedCourse },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const publishCourseChapter = async (req, params) => {
  const { id: courseId, chapterId } = await params;
  const userId = req.user.id;
  try {
    if (!userId) {
      return customMessage("Unauthorized access", {}, 401);
    }

    const myCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!myCourse) {
      return customMessage("Unauthorized access", {}, 401);
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!chapter || !chapter.title || !chapter.description) {
      return customMessage("Missing required fields", {}, 400);
    }

    if (chapter.mediaType === "VIDEO") {
      if (!chapter.videoUrl) {
        return customMessage("Missing required fields", {}, 400);
      }
    }

    const publishChapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: true,
      },
    });

    return customMessage(
      "Course chapter published successfully",
      { publishChapter },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const unpublishCourseChapter = async (req, params) => {
  const { id: courseId, chapterId } = await params;
  const userId = req.user.id;
  try {
    if (!userId) {
      return customMessage("Unauthorized access", {}, 401);
    }

    const myCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!myCourse) {
      return customMessage("Unauthorized access", {}, 401);
    }

    const unPublished = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        isPublished: false,
      },
    });

    const publishedChaptersInCourse = await prisma.chapter.findMany({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return customMessage(
      "Course chapter unpublished successfully",
      { unPublished },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const updateCourseChapter = async (req, params) => {
  try {
    const { chapterId, id: courseId } = await params;

    const userId = req.user.id;
    const updates = await req.json();

    if (!chapterId) {
      return customMessage("Chapter ID is required", {}, 400);
    }

    if (!isValidUUID(courseId) || !isValidUUID(chapterId)) {
      return customMessage("Invalid Chapter ID or Course ID", {}, 400);
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return customMessage("Chapter not found", {}, 404);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return customMessage("Course not found", {}, 404);
    }

    if (course.userId !== userId) {
      return customMessage(
        "Unauthorized: you do not have the required permission to perform this action",
        {},
        401
      );
    }

    if (updates?.title) {
      const titleExist = await prisma.chapter.findFirst({
        where: {
          title: sanitize(updates.title),
          id: chapterId,
        },
      });
      if (titleExist) {
        return customMessage("Chapter title already exist.", {}, 409);
      }
    }

    // Sanitize title if provided
    if (updates?.title) {
      updates.title = sanitize(updates.title);
    }

    if (updates?.description) {
      updates.description = sanitize(updates.description);
    }

    if (updates?.isFree) {
      updates.isFree = !!updates.isFree;
    }
    // handle video upload

    await prisma.chapter.update({
      where: { id: chapterId, courseId },
      data: {
        ...updates,
      },
    });

    return customMessage(`Course chapter updated successfully`, {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const reorderCourceChapter = async (req, params) => {
  try {
    const { id: courseId } = await params;

    const userId = req.user.id;
    const { list } = await req.json();

    if (!courseId) {
      return customMessage("Course ID is required", {}, 400);
    }

    if (!isValidUUID(courseId)) {
      return customMessage("Invalid course ID", {}, 400);
    }

    const courseOwner = await prisma.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!courseOwner) {
      return customMessage("Unauthorized", {}, 401);
    }

    for (let item of list) {
      await prisma.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }
    return customMessage("Chapters reordered successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllCategories = async () => {
  try {
    const categories = await prisma.courseCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      createdAt: cat.createdAt,
      courseCount: cat._count.courses,
    }));

    return customMessage(
      "Categories retrieved successfully",
      {
        count: formatted.length,
        categories: formatted,
      },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllCourses = async (req) => {
  const query = req.nextUrl.searchParams;

  const page = parseInt(query.get("page")) || 1;
  const limit = parseInt(query.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const search = query.get("search")?.trim().toLowerCase();

  let isPublished = query.get("isPublished")?.trim();
  isPublished =
    isPublished === "true" || isPublished === "false"
      ? isPublished === "true"
      : null;

  const minPrice = query.get("minPrice")
    ? parseFloat(query.get("minPrice"))
    : null;
  const maxPrice = query.get("maxPrice")
    ? parseFloat(query.get("maxPrice"))
    : null;

  let categoryId = query.get("categoryId")?.trim();
  categoryId = isValidUUID(categoryId) ? categoryId : null;

  try {
    //  dynamic filters
    const filters = {};

    if (search) {
      filters.OR = [{ name: { contains: search } }];
    }

    if (minPrice !== null || maxPrice !== null) {
      filters.price = {};
      if (minPrice !== null) filters.price.gte = minPrice;
      if (maxPrice !== null) filters.price.lte = maxPrice;
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (isPublished !== null) {
      filters.isPublished = isPublished;
    }

    //  Fetch filtered products
    const courses = await prisma.course.findMany({
      where: filters,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        price: true,
        createdAt: true,
        asset: true,
        isPublished: true,
        category: { select: { id: true, name: true } },
        chapters: true,
        attachments: true,
      },
    });

    const totalCount = await prisma.course.count({ where: filters });

    return customMessage(
      "Courses retrieved successfully",
      { count: courses.length, totalCount, courses },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getAllPublishedCourses = async (req, queryParams) => {
  const { title, categoryId, page = 1, limit = 10 } = queryParams || {};
  const skip = (page - 1) * limit;
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(title && { title: { contains: title } }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        purchases: {
          where: {
            userId: req.user.id,
          },
        },
      },

      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    });

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        if (course.purchases.length === 0) {
          return {
            ...course,
            progress: null,
          };
        }

        const publishedChapters = await prisma.chapter.findMany({
          where: {
            courseId: course.id,
            isPublished: true,
          },
          select: {
            id: true,
          },
        });

        const publishedChapterIds = publishedChapters.map(
          (chapter) => chapter.id
        );

        const completedChapters = await prisma.userProgress.count({
          where: {
            userId: req.user.id,
            chapterId: {
              in: publishedChapterIds,
            },
            isCompleted: true,
          },
        });

        const progressPercentage =
          publishedChapterIds.length > 0
            ? (completedChapters / publishedChapterIds.length) * 100
            : 0;

        return {
          ...course,
          progress: progressPercentage,
        };
      })
    );

    return customMessage(
      "Courses retrieved successfully",
      { count: courses.length, courses: coursesWithProgress },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getProgress = async (req, params) => {
  const { courseId } = params;
  try {
    const publishedChapters = await prisma.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });
    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const completedChapters = await prisma.userProgress.count({
      where: {
        userId: req.user.id,
        chapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      },
    });
    const progressPercentage =
      (completedChapters / publishedChapterIds.length) * 100;

    return customMessage(
      "Courses progress retrieved successfully",
      { progressPercentage },
      200
    );
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const markChapterAsCompleted = async (req, queryParams) => {
  try {
    const { isCompleted } = await req.json();
    const { id: courseId, chapterId } = queryParams;

    const userId = req.user.id;

    if (!courseId) {
      return customMessage("course ID is required", {}, 400);
    }

    if (!isValidUUID(courseId)) {
      return customMessage("Invalid course ID", {}, 400);
    }

    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId,
        isCompleted,
      },
    });
    return customMessage("Course progress updated", { userProgress }, 200);
  } catch (error) {
    console.log(error);
    return ServerError(error, {}, 500);
  }
};

const getSingleCourse = async (req, params) => {
  const { id } = await params;

  const userId = req.user.id;

  if (!id) {
    return customMessage("course ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid course ID", {}, 400);
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            userProgress: {
              where: {
                userId,
              },
            },
          },
          orderBy: { position: "asc" },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const enrolled = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: id,
        },
      },
    });

    if (!course) {
      return customMessage("Course not found", {}, 404);
    }

    return customMessage("Course found", { course, enrolled }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const getSingleChapter = async (req, params) => {
  const { chapterId, id } = await params;

  const userId = req.user.id;

  if (!chapterId) {
    return customMessage("chapter ID is required", {}, 400);
  }

  if (!userId) {
    return customMessage("User ID is required", {}, 400);
  }

  if (!isValidUUID(chapterId) || !isValidUUID(id)) {
    return customMessage("Invalid IDs", {}, 400);
  }

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId, courseId: id },
      include: {
        muxData: true,
      },
    });

    if (!chapter) {
      return customMessage("Chapter not found", {}, 404);
    }

    return customMessage("chapter found", { chapter }, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCategory = async (req, params) => {
  const { id } = await params;

  if (!id) {
    return customMessage("Category ID is required", {}, 400);
  }

  if (!isValidUUID(id)) {
    return customMessage("Invalid Category ID", {}, 400);
  }

  try {
    const categoryExist = await prisma.courseCategory.findUnique({
      where: { id },
      include: { courses: true },
    });

    if (!categoryExist) {
      return customMessage("Category not found or does not exist.", {}, 404);
    }

    // Delete all courses under the category
    await prisma.course.deleteMany({
      where: { categoryId: id },
    });

    // delete the category
    await prisma.courseCategory.delete({
      where: { id },
    });

    return customMessage("Course category deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCourse = async (req, params) => {
  const { id } = params;
  const userId = req.user?.id;

  if (!id || !userId) {
    return customMessage("Missing required fields.", {}, 400);
  }

  if (!isValidUUID(id) || !isValidUUID(userId)) {
    return customMessage("Invalid Course ID or User ID", {}, 400);
  }

  try {
    // Fetch course with related chapters, Mux data, and attachments
    const course = await prisma.course.findUnique({
      where: { id, userId },
      include: {
        chapters: { include: { muxData: true } },
        attachments: true,
      },
    });

    if (!course) {
      return customMessage("Course not found or does not exist.", {}, 404);
    }

    const chapterIds = course.chapters.map((chapter) => chapter.id);
    const muxPublicIds = course.chapters
      .map((chapter) => chapter.muxData?.publicId)
      .filter(Boolean);

    const attachmentPublicIds = course.attachments
      .map((attachment) => attachment.asset?.publicId)
      .filter(Boolean);

    // Delete chapters, Mux data, and attachments in parallel
    await Promise.allSettled([
      chapterIds.length > 0 &&
        prisma.chapter.deleteMany({ where: { id: { in: chapterIds } } }),

      chapterIds.length > 0 &&
        prisma.muxData.deleteMany({ where: { chapterId: { in: chapterIds } } }),

      muxPublicIds.length > 0 && removeUploadedImage(muxPublicIds, "video"),

      attachmentPublicIds.length > 0 &&
        removeUploadedImage(attachmentPublicIds, "raw"),

      course.attachments.length > 0 &&
        prisma.attachment.deleteMany({ where: { courseId: id } }),
    ]);

    // Remove course image if it exists
    if (course.asset?.publicId) {
      await removeUploadedImage(
        [course.asset.publicId],
        course.asset.resourceType
      );
    }

    // Delete course
    await prisma.course.delete({ where: { id, userId } });

    return customMessage("Course deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCourseChapter = async (req, params) => {
  const { chapterId, id: courseId } = params;
  const userId = req.user?.id;

  // Validate required fields
  if (!courseId || !userId || !chapterId) {
    return customMessage("Missing required fields.", {}, 400);
  }

  // Validate UUIDs
  if (
    !isValidUUID(courseId) ||
    !isValidUUID(userId) ||
    !isValidUUID(chapterId)
  ) {
    return customMessage("Invalid Course, Chapter, or User ID", {}, 400);
  }

  try {
    // Check if the course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!courseExists) {
      return customMessage("Course not found.", {}, 404);
    }

    // Delete chapter
    const deletedChapter = await prisma.chapter.delete({
      where: { id: chapterId, courseId },
    });

    if (deletedChapter) {
      const existingMuxData = await prisma.muxData.findUnique({
        where: { chapterId },
      });

      // Delete Mux data and video in parallel
      await Promise.allSettled([
        existingMuxData && prisma.muxData.delete({ where: { chapterId } }),
        existingMuxData?.publicId &&
          removeUploadedImage([existingMuxData.publicId], "video"),
      ]);
    }

    // Count remaining published chapters
    const publishedChapterCount = await prisma.chapter.count({
      where: { courseId, isPublished: true },
    });

    // If no published chapters remain, unpublish the course
    if (publishedChapterCount === 0) {
      await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: false },
      });
    }

    return customMessage("Course chapter deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteCourseAttachment = async (req, params) => {
  const { id: courseId, attachmentId } = params;

  const userId = req.user?.id;

  if (!courseId || !attachmentId || !userId) {
    return customMessage("Missing required fields.", {}, 400);
  }

  if (
    !isValidUUID(courseId) ||
    !isValidUUID(attachmentId) ||
    !isValidUUID(userId)
  ) {
    return customMessage(
      "Invalid Course ID, Attachment ID, or User ID",
      {},
      400
    );
  }

  try {
    // Fetch the attachment to get its publicId
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId, courseId },
    });

    if (!attachment) {
      return customMessage("Attachment not found.", {}, 404);
    }

    // Extract publicId for deletion from Cloudinary
    const publicId = attachment.asset?.publicId;

    await Promise.allSettled([
      publicId && removeUploadedImage([publicId], "raw"),
      prisma.attachment.delete({ where: { id: attachmentId } }),
    ]);

    return customMessage("Attachment deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

const deleteMultipleCourses = async (req) => {
  try {
    const idsObj = await req.json();

    if (!idsObj || typeof idsObj !== "object") {
      return customMessage("No course IDs provided", {}, 400);
    }

    const ids = Object.values(idsObj);

    const invalidIds = ids.filter((id) => !isValidUUID(id));
    if (invalidIds.length > 0) {
      return customMessage("One or more invalid course IDs", {}, 400);
    }

    const courses = await prisma.course.findMany({
      where: { id: { in: ids } },
      include: {
        chapters: { include: { muxData: true } },
        attachments: true,
      },
    });

    if (courses.length === 0) {
      return customMessage("No course found for the provided IDs", {}, 404);
    }

    for (const course of courses) {
      const chapterIds = course.chapters.map((chapter) => chapter.id);
      const muxPublicIds = course.chapters
        .map((chapter) => chapter.muxData?.publicId)
        .filter(Boolean);

      const attachmentPublicIds = course.attachments
        .map((attachment) => attachment.asset?.publicId)
        .filter(Boolean);

      const assetPublicId = course.asset?.publicId;

      await Promise.allSettled(
        [
          // Delete Course Chapters
          chapterIds.length > 0 &&
            prisma.chapter.deleteMany({ where: { id: { in: chapterIds } } }),

          // Delete Mux Data
          chapterIds.length > 0 &&
            prisma.muxData.deleteMany({
              where: { chapterId: { in: chapterIds } },
            }),

          // Remove the corresponding muxData videos
          muxPublicIds.length > 0 && removeUploadedImage(muxPublicIds, "video"),

          // Remove the corresponding attachments from Cloudinary
          attachmentPublicIds.length > 0 &&
            removeUploadedImage(attachmentPublicIds, "raw"),

          // Delete the attachments from the database
          course.attachments.length > 0 &&
            prisma.attachment.deleteMany({ where: { courseId: course.id } }),

          // Remove the course image from Cloudinary
          assetPublicId &&
            removeUploadedImage([assetPublicId], course.asset.resourceType),
        ].filter(Boolean)
      );
    }

    await prisma.course.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return customMessage("Courses deleted successfully", {}, 200);
  } catch (error) {
    return ServerError(error, {}, 500);
  }
};

export const trainingControllers = {
  createNewCourse,
  createCourseCategory,
  createCourseChapter,
  enrollInCourse,
  updateCategory,
  updateCourse,
  reorderCourceChapter,
  publishCourse,
  unpublishCourse,
  publishCourseChapter,
  unpublishCourseChapter,
  updateCourseChapter,
  getAllCategories,
  getAllCourses,
  getAllPublishedCourses,
  getProgress,
  getSingleCourse,
  getSingleChapter,
  deleteCategory,
  deleteCourse,
  deleteCourseChapter,
  deleteCourseAttachment,
  deleteMultipleCourses,
  markChapterAsCompleted,
};
