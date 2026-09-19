import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { AllTools } from '@/pages/AllTools'
import { NotFound } from '@/pages/NotFound'
import { CompressImagePage } from '@/tools/compress-image/CompressImagePage'
import { ResizeImagePage } from '@/tools/resize-image/ResizeImagePage'
import { ImageOperationPage } from '@/tools/image/ImageOperationPage'
import { PdfOperationPage } from '@/tools/pdf/PdfOperationPage'
import { TextOperationPage } from '@/tools/text/TextOperationPage'
import { DataOperationPage } from '@/tools/data/DataOperationPage'
import { MediaOperationPage } from '@/tools/media/MediaOperationPage'
import { OcrOperationPage } from '@/tools/ocr/OcrOperationPage'
import { DocumentOperationPage } from '@/tools/document/DocumentOperationPage'
import { UtilityOperationPage } from '@/tools/utility/UtilityOperationPage'
import { BatchImagePage } from '@/tools/image/BatchImagePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tools" element={<AllTools />} />
        <Route path="tools/compress-image" element={<CompressImagePage />} />
        <Route path="tools/resize-image" element={<ResizeImagePage />} />
        <Route path="tools/image/:operation" element={<ImageOperationPage />} />
        <Route path="tools/pdf/:operation" element={<PdfOperationPage />} />
        <Route path="tools/text/:operation" element={<TextOperationPage />} />
        <Route path="tools/data/:operation" element={<DataOperationPage />} />
        <Route path="tools/media/:operation" element={<MediaOperationPage />} />
        <Route path="tools/ocr" element={<OcrOperationPage />} />
        <Route path="tools/document/:operation" element={<DocumentOperationPage />} />
        <Route path="tools/utility/:operation" element={<UtilityOperationPage />} />
        <Route path="tools/image/batch" element={<BatchImagePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
