import { Brain, File, Pen } from "lucide-react";

const nodeOptions = {
    start: {
        icon: <Pen size={14} />,
        label: "Input text",
        bgColorHash: '#DDFFD6',
        type: 'start',
        textColorHash: '#376D2B'
    },
    knowledgeBase: {
        icon: <File size={14} />,
        label: "Knowledge base",
        bgColorHash: '#E9D6FF',
        type: 'knowledgeBase',
        textColorHash: '#6E469E'
    },
    llm: {
        icon: <Brain size={14} />,
        label: "LLM",
        bgColorHash: '#FFD6D6',
        type: 'llm',
        textColorHash: '#612E2C'
    },
    textInput: {
        icon: <Pen size={14} />,
        label: "Text input",
        bgColorHash: '#FFD6D6',
        type: 'text',
        textColorHash: '#612E2C'
    }
};

export default nodeOptions;