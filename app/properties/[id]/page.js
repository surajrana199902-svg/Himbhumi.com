import { Detail, WebsiteChatbot } from '../../_views'
import PropertyDetailActions from '../../../components/property-detail-actions'

export default async function PropertyDetailPage({ params }) {
  const { id } = await params
  return <><Detail id={id} /><PropertyDetailActions propertyId={id} /><WebsiteChatbot /></>
}
