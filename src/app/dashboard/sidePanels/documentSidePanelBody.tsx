import FilePicker from "@/components/ui/filePicker"
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle"

const DocumentSidePanelBody = ({ node }: { node: any }) => {
    return <div>
        <TitleAndSubtitle title="Upload your document" description="You can upload PDF, Markdown, JPEG, PNG files"/>
        <FilePicker onFileSelected={() => {}} />
    </div>
}

export default DocumentSidePanelBody;