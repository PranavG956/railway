import React from 'react'
import AdminDashboard from '@/components/AdminDashboard'

const Page = () => {
  return (
    <div>
      <AdminDashboard/>
    </div>
  )
}

export default Page

export async function generateMetadata({ params }) {
  return {
    title : `Railinks - Admin`,
  }
}
