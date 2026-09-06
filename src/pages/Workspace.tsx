import { WorkspaceProvider } from '@/workspace/WorkspaceContext'
import { WorkspaceApp } from '@/components/workspace/WorkspaceApp'

export default function Workspace() {
  return (
    <WorkspaceProvider>
      <WorkspaceApp />
    </WorkspaceProvider>
  )
}
