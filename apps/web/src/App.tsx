import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DocumentListPage } from "./pages/DocumentListPage";
import { DocumentReviewPage } from "./pages/DocumentReviewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocumentListPage />} />
        <Route path="/documents/:id" element={<DocumentReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
