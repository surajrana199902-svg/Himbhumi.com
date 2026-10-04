import { Detail, WebsiteChatbot } from '../../_views'

export default async function PropertyDetailPage({ params }) {
  const { id } = await params
  return <><Detail id={id} /><WebsiteChatbot /></>
}
