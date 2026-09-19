import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { AllTools } from '@/pages/AllTools'
import { NotFound } from '@/pages/NotFound'
import { CompressImagePage } from '@/tools/compress-image/CompressImagePage'
import { ResizeImagePage } from '@/tools/resize-image/ResizeImagePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tools" element={<AllTools />} />
        <Route path="tools/compress-image" element={<CompressImagePage />} />
        <Route path="tools/resize-image" element={<ResizeImagePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
