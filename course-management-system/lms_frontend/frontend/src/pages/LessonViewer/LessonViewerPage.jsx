import { useParams } from "react-router-dom";

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  return (
    <div>
      <h2 style={{ margin: 0 }}>Lesson Viewer</h2>
      <p style={{ opacity: 0.7 }}>
        Course: {courseId} | Lesson: {lessonId}
      </p>
      <p style={{ opacity: 0.7 }}>Step 8 will implement lesson content + progress tracking.</p>
    </div>
  );
}