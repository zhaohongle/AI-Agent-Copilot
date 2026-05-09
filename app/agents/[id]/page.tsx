import AgentDetailClient from './AgentDetailClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function AgentDetailPage() {
  return <AgentDetailClient />
}
