import TextSummarizer from "@/components/TextSummarizer"

export default async function SummarizePage({ params }) {
  const {id}=await(params)
  return (
    <div className="h-full">
      <TextSummarizer noteId={id} />
    </div>
  )
}
