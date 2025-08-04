import React from 'react'

const Page = () => {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col justify-center items-center">
      <h3 className="text-xl font-bold mb-4">This is a metro booking website created to book your tickets easily</h3>
      <p className="text-lg text-gray-600 mb-8">Book your metro tickets easily and quickly online.</p>
    </div>
  )
}

export default Page

export async function generateMetadata({ params }) {
  return {
    title : `Railinks - About`,
  }
}
