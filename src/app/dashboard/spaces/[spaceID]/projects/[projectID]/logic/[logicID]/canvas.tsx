'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  ReactFlowInstance,
  NodeProps,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import InputNode from '@/components/nodes/inputNode';
import LLMNode from '@/components/nodes/llmNode';
import OutputNode from '@/components/nodes/outputNode';
import flowService from '@/services/flow';
import nodeService from '@/services/node';
import { Button } from '@/components/ui/button';
import { Clock, Download, PlayIcon } from 'lucide-react';
import { getFileStatusFromRemoteFile, merge } from '@/lib/utils';
import { API_STREAM_EVENT_TYPE } from '@/types/common';
import Document from '@/components/nodes/documents';
import SidePanel, { SidePanelBody, SidePanelDescription, SidePanelTitle } from '@/components/ui/sidePanel';
import { Badge } from '@/components/ui/badge';
import LLMSidePanelBody from './sidePanels/llmSidePanelBody';
import InputSidePanelBody from './sidePanels/inputSidePanelBody';
import DocumentSidePanelBody, { FileUploadedType } from './sidePanels/documentSidePanelBody';
import ButtonEdge from '@/components/buttonEdge';

import { PDFDocument } from 'pdf-lib';
import docService from '@/services/docService';
import storage from '@/services/storage';
import TextNode from '@/components/nodes/textNode';
import ImageNode from '@/components/nodes/imageNode';
import ImageSidePanelBody from './sidePanels/imageSidePanel';
import TextSidePanelBody from './sidePanels/textSidePanel';
import TextOutputNode from '@/components/nodes/textOutputNode';
import ImageOutputNode from '@/components/nodes/imageOutputNode';
import { ThemeToggle } from '@/components/theme-toggle';

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

let resNode: any, textOutputNode: any;

export const Canvas = ({ projectID, flowID, spaceID }: { projectID: string, flowID: string, spaceID: string }) => {
  const [flow, setFlow] = useState<{
    id: string,
    name: string
  }>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])
  const setNodeRef = useRef(setNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hasChanges, setHasChanges] = useState(false);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [flowLoaded, setFlowLoaded] = useState(false);
  const [isFlowRunning, setIsFlowRunning] = useState<boolean>();
  const [sidePanel, setSidePanel] = useState<{
    id: string,
    isOpen: boolean
  }>();

  useEffect(() => {
    const runStateObj: Record<string, any> = {
      runStartedAt: isFlowRunning ? new Date() : undefined,
    };

    if (isFlowRunning) {
      runStateObj.runCompletedAt = new Date();
    }

    updateNode({
      all: true,
      toUpdateValues: {
        data: {
          runState: runStateObj
        }
      }
    })
  }, [isFlowRunning]);

  const updateSelf = (id: string, data: Record<string, any>) => {
    updateNode({
      id,
      toUpdateValues: data
    });
  }

  const handleOnNodeClick = (isOpen = false, id: string) => {
    setSidePanel({
      id,
      isOpen
    });
  }

  const edgeTypes = useMemo(() => ({
    buttonEdge: (props: EdgeProps) => <ButtonEdge {...props} />
  }), []);

  const nodeTypes = useMemo(() => ({
    start: (props: NodeProps) => <InputNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    llm: (props: NodeProps) => <LLMNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    res: (props: NodeProps) => <OutputNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    knowledgeBase: (props: NodeProps) => <Document {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    text: (props: NodeProps) => <TextNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    image: (props: NodeProps) => <ImageNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    textOutput: (props: NodeProps) => <TextOutputNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
    imageOutput: (props: NodeProps) => <ImageOutputNode {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />
  }), []);

  const updateNode = (opts: {
    id?: string,
    node?: Node,
    toUpdateValues?: Record<string, any>,
    type?: string,
    all?: boolean,
    mergeLeafNodes?: boolean
  }) => {
    if (opts.mergeLeafNodes === undefined) opts.mergeLeafNodes = true;

    if (!setNodeRef.current) return;
    setNodeRef.current((currentNodes: any) => {
      const { id, node, toUpdateValues, type, all, mergeLeafNodes } = opts;

      if ((!node && !id && !type && !all) || (toUpdateValues && !Object.keys(toUpdateValues).length)) {
        return;
      }
      const updatedNodes = currentNodes.map((n: Node) => {
        if (type && n.type !== type) {
          return n;
        }
        else if (!type && (id || node)) {
          const nodeID = node?.id || id;
          if (n.id !== nodeID) {
            return n;
          }
          if (node) return node;
        }

        delete toUpdateValues!.id;
        delete toUpdateValues!.type;

        const newNode = {
          ...n,
          ...toUpdateValues,
          data: merge(n?.data || {}, toUpdateValues?.data || {}, mergeLeafNodes)
        }
        return newNode;
      });
      return updatedNodes;
    })
  }

  const handleRunEvent = async (eventData: API_STREAM_EVENT_TYPE) => {
    const { nodeID, data, runID, nodeType } = eventData;
    resNode = resNode || nodes.find((n) => n.type === 'res');
    if (resNode && (eventData.data?.delta || eventData.data?.text) && nodeType === 'res') {
      textOutputNode = textOutputNode || nodes.find((n) => n.type === 'textOutput');
      if (!textOutputNode) return;
      updateNode({
        id: textOutputNode.id,
        toUpdateValues: {
          data: {
            runState: {
              status: data.error ? 'error' : 'success',
              data: [
                eventData
              ],
              at: new Date().toUTCString(),
              runID: runID
            }
          }
        }
      });
    }
    else {
      updateNode({
        id: nodeID,
        toUpdateValues: {
          data: {
            runState: {
              status: data.error ? 'error' : 'success',
              data: [
                eventData
              ],
              at: new Date().toUTCString(),
              runID: runID
            }
          }
        }
      });
    }
  }

  const handleRunEventDone = async () => {
    setIsFlowRunning(false);
  }
  const handleFlowRun = async () => {
    updateNode({
      all: true,
      toUpdateValues: {
        data: {
          runState: {}
        }
      },
      mergeLeafNodes: false
    });

    setIsFlowRunning(true);
    await nodeService.runFlow(spaceID, projectID, String(flowID), {
      nodes: reactFlowInstance?.getNodes(),
      edges: reactFlowInstance?.getEdges(),
      viewport: reactFlowInstance?.getViewport()
    }, handleRunEvent, handleRunEventDone);
  }
  useEffect(() => {
    const handler = (e: any) => {
      setSidePanel({
        id: '',
        isOpen: false
      });
      const id = e.detail.id;
      const nodesToDelete = nodes.filter(n => n.id == id);
      reactFlowInstance?.deleteElements({ nodes: nodesToDelete });
    }
    window.addEventListener('delete-node', handler)
    return () => window.removeEventListener('delete-node', handler)
  }, [nodes])

  useEffect(() => {
    setHasChanges(true);
  }, [nodes, edges]);

  useEffect(() => {
    flowService.getFlow(flowID, projectID, spaceID).then(async (res) => {
      setFlow({
        id: res.id,
        name: res.name
      });
      if (res.flow?.edges) {
        setEdges(res.flow.edges);
      }
      if (res.flow?.viewport) {
        reactFlowInstance?.setViewport(res.flow.viewport)
      }

      setNodes(res.flow.nodes || []);

      setFlowLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!flowLoaded) return;

    const saveFlow = async () => {
      console.log('save flow: ', saveFlow)
      if (!hasChanges) return;

      try {
        const flow = {
          nodes: reactFlowInstance?.getNodes(),
          edges: reactFlowInstance?.getEdges(),
          viewport: reactFlowInstance?.getViewport(),
        };

        await flowService.saveFlow(projectID, { id: flowID, flow }, spaceID);
        setHasChanges(false);
        console.log('Flow autosaved');
      } catch (err) {
        console.error('Auto save errored out:', err);
      }
    };

    saveIntervalRef.current = setInterval(saveFlow, 5000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [flowLoaded, hasChanges, reactFlowInstance]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = {
        ...params,
        type: 'buttonEdge'
      }
      setEdges((eds) => {
        return addEdge(newEdge, eds)
      })
    },
    [setEdges]
  )

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const getNodeData = (type: string, baseId: string) => {
    if (!reactFlowInstance) return null;
    const currTypeNodes = reactFlowInstance.getNodes().filter((n) => n.type === type);
    const currentNodesTypeLength = currTypeNodes.length + 1;
    
    const id = `${baseId}-${currTypeNodes.length}`;
    const uniqueIdentifier = new Date().toISOString();
    switch (type) {
      case 'output': return {
        id,
        data: {
            uniqueIdentifier,
            label: `Output ${currentNodesTypeLength}`,
            nodeName: 'Output',
            description: `You'll find your application output here`
          }
        };
      case 'start': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Input ${currentNodesTypeLength}`,
          nodeName: 'Input',
          description: `This is entry point of your application, you can add your query here to test out the flow.`
        }
      };
      case 'res': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Output ${currentNodesTypeLength}`,
          nodeName: 'Output',
          description: 'Connect the output types you want to support to this node'
        }
      };
      case 'llm': return {
        id,
        data: {
          uniqueIdentifier,
          label: `LLM ${currentNodesTypeLength}`,
          nodeName: 'LLM',
          description: `Configure your Large Language Model (LLM)`
        }
      };
      case 'knowledgeBase': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Knowledge base ${currentNodesTypeLength}`,
          nodeName: 'Knowledge base',
          description: `Add documents to your knowledge base and search through them`
        }
      };
      case 'text': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Text ${currentNodesTypeLength}`,
          nodeName: 'Text',
          description: `You can add text input here.`
        }
      };
      case 'image': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Image ${currentNodesTypeLength}`,
          nodeName: 'Image',
          description: `You can add image input here`
        }
      };
      case 'textOutput': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Text output ${currentNodesTypeLength}`,
          nodeName: 'Text output',
          description: 'You can visualize your text output here'
        }
      };
      case 'imageOutput': return {
        id,
        data: {
          uniqueIdentifier,
          label: `Image output ${currentNodesTypeLength}`,
          nodeName: 'Image output',
          description: 'You can visualize your image output here'
        }
      };
      default: return null;
    }
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const nodeData = event.dataTransfer.getData('application/reactflow');
    const parsedNodeData = JSON.parse(nodeData);
    const { type, id } = parsedNodeData;

    if (!type || !reactFlowInstance || !wrapperRef.current) return

    const bounds = wrapperRef.current.getBoundingClientRect()

    const position = reactFlowInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const nodeDetails = getNodeData(type, id);
    if (!nodeDetails) return;

    const newNode: Node = {
      id: nodeDetails.id,
      type: type,
      position,
      data: nodeDetails.data
    }

    setNodes((nds) => nds.concat(newNode))
  }

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges)
          const outgoers = getOutgoers(node, nodes, edges)
          const connectedEdges = getConnectedEdges([node], edges)

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          )

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
              type: 'buttonEdge'
            }))
          )

          return [...remainingEdges, ...createdEdges]
        }, edges)
      )
    },
    [nodes, edges]
  )

  const getSidePanelNode = (id: string) => {
    const allNodes = reactFlowInstance?.getNodes();
    const node = allNodes?.find((n) => n.id === id);
    if (!node) return null;
    return node;
  }

  async function getFileIdentifier(file: File) {
    const fileIdentifier = await docService.getFileRefID({
      spaceID,
      fileName: file.name
    });
    if (!fileIdentifier) throw new Error("Could not process file");
    return fileIdentifier.key;
  }

  async function handleFileUpload(file: File, nodeID: string) {
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are supported.");
    }

    if (file.size <= maxSizeBytes) {
      const presignedURL = await storage.generateSequentialUploadSignedUrls({
        spaceID,
        count: 1,
        fileName: file.name
      });

      await storage.uploadBlob({
        url: presignedURL.presignedURLs[0].uploadURL,
        data: file
      });

      return;
    }

    const numberOfPresignedURLs = 10;
    let preSignedURLIndex = 0;
    let presignedURLs = await storage.generateSequentialUploadSignedUrls({
      spaceID,
      count: numberOfPresignedURLs,
      fileName: file.name
    });

    for await(const pageBlob of docService.yieldPDFPages(file)) {
      if (preSignedURLIndex === numberOfPresignedURLs - 1) {
        presignedURLs = await storage.generateSequentialUploadSignedUrls({
          spaceID,
          count: numberOfPresignedURLs,
          fileName: file.name
        });
        preSignedURLIndex = 0;
      }
      const { uploadURL } = presignedURLs.presignedURLs[preSignedURLIndex];
      await storage.uploadBlob({
        url: uploadURL,
        data: pageBlob
      });
      preSignedURLIndex += 1;
    }
  }

  async function onFileSelected(file: File, nodeID: string) {
    try {
      const node = nodes.find((n) => n.id === nodeID);
      if (!node) throw new Error('Node not found');
      const mode = node.data.config.mode;
      await handleFileUpload(file, nodeID);
      const res = await docService.completeUpload({
        spaceID: spaceID,
        fileName: file.name,
        mode
      });
      if (!res) throw new Error('Upload completion failed')
      return res;
    }
    catch (error) {
      console.debug('File upload failed', error);
      throw new Error("File upload failed");
    }
  }

  async function getRemoteFiles(): Promise<FileUploadedType[]> {
    const files = await docService.getFiles({
      spaceID
    });
    return files.map((file: Record<string, any>) => ({
      id: file.key,
      fileName: file.fileName,
      fileExt: file.fileExt,
      size: file.size,
      filePath: file.path,
      status: getFileStatusFromRemoteFile(file) as 'uploading' | 'uploaded' | 'errored' | 'successful' | 'indexing'
    }));
  }

  const getIncomingNodes = (
    node: any, 
    incomingNodes: Array<Node> = [], 
    nodesMap: { nodes: Record<string, Node>, size: number } = { nodes: {}, size: 0 },
    seenNodes: Set<string> = new Set()
  ) => {
    if (!nodesMap.size) {
      for (const node of nodes) {
        nodesMap.nodes[node.id] = node;
        nodesMap.size += 1;
      }
    }
    const immediateIncomingNodeIds = edges.filter((e) => e.source === node.id).map((e) => e.target);
    for (const nodeId of immediateIncomingNodeIds) {
      if (seenNodes.has(nodeId)) continue;
      const node = nodesMap.nodes[nodeId];
      incomingNodes.push(node);
      getIncomingNodes(node, incomingNodes, nodesMap, seenNodes);
      seenNodes.add(nodeId);
    }
    return incomingNodes;
  }

  const getDocumentSidePanelBody = (node: any) => {
    const incomingNodes = getIncomingNodes(node)

    return <DocumentSidePanelBody
      incomingNodes={incomingNodes}
      node={node}
      updateNode={updateNode}
      onFileSelected={(file: File) => onFileSelected(file, node.id)} 
      getFileIdentifier={(file: File) => getFileIdentifier(file)} 
      getRemoteFiles={() => getRemoteFiles()}
      spaceID={spaceID}
    />
  }

  const getImageSidePanelBody = (node: any) => {
    const incomingNodes = getIncomingNodes(node)

    return <ImageSidePanelBody
      node={node}
      updateNode={updateNode}
    />
  }

  const getLLMSidePanelBody = (node: any) => {
    const incomingNodes = getIncomingNodes(node);
    return <LLMSidePanelBody spaceID={spaceID} node={node} updateNode={updateNode} incomingNodes={incomingNodes} projectID={projectID} />
  }

  const getTextSidePanelBody = (node: any) => {
    return <TextSidePanelBody node={node} updateNode={updateNode} />
  }

  const getResNodeSidePanelBody = (node: any) => {
    return <></>
  }

  const getSidePanelData = (id: string) => {
    const sidePanelNode = getSidePanelNode(id);
    let body = <></>;
    if (!sidePanelNode) return {
      body
    };

    const getInputSidePanelBody = (node: any) => {
      return <InputSidePanelBody node={node} updateNode={updateNode} />;
    }

    switch (sidePanelNode.type) {
      case 'start': body = getInputSidePanelBody(sidePanelNode); break;
      case 'knowledgeBase': body = getDocumentSidePanelBody(sidePanelNode); break;
      case 'llm': body = getLLMSidePanelBody(sidePanelNode); break;
      case 'res': body = getResNodeSidePanelBody(sidePanelNode); break;
      case 'image': body = getImageSidePanelBody(sidePanelNode); break;
      case 'text': body = getTextSidePanelBody(sidePanelNode); break;
      default: break;
    }
    return {
      node: sidePanelNode,
      body
    }
  }

  const [sidePanelComponent, setSidePanelComponent] = useState(<></>);

  useEffect(() => {
    const sidePanelData = getSidePanelData(sidePanel?.id || '');
    const currSidePanelComponent = <SidePanel
      key={String(sidePanel?.id || new Date())}
      open={sidePanel?.isOpen}
      onClose={() => setSidePanel({
        isOpen: false,
        id: ''
      })}
    >
      <SidePanelBody>
        {
          sidePanelData.body
        }
      </SidePanelBody>
      <SidePanelTitle>
        {
          <div className='flex gap-2'>
            <h1>{sidePanelData.node?.data?.label}</h1>
            <Badge variant="secondary">{sidePanelData.node?.id}</Badge>
          </div>
        }
      </SidePanelTitle>
      {sidePanelData.node?.data?.description ? <SidePanelDescription>
        {
          sidePanelData.node?.data?.description
        }
      </SidePanelDescription> : <></>}
    </SidePanel>
    setSidePanelComponent(currSidePanelComponent);
  }, [nodes, sidePanel]);

  const handleEdgeMouseEnter = (e: any, edgeProp: any) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === edgeProp.id) {
          return {
            ...edge, style: { stroke: 'blue', filter: 'drop-shadow(0 0 8px rgba(0, 0, 255, 0.6))' }, data: {
              showDeleteButton: true
            }
          };
        } else {
          return edge;
        }
      })
    );
  };

  const handleEdgeMouseLeave = (e: any, edge: any) => {
    setEdges((edges) =>
      edges.map((edg) => {
        if (edg.id === edge.id) {
          return {
            ...edg, style: { stroke: 'gray' }, data: {
              showDeleteButton: false
            }
          };
        } else {
          return edg;
        }
      })
    );
  };

  return (
    <div className='flex flex-col w-full h-full'>
      <div className="flex w-full items-center justify-between p-2 gap-2 border-b-1">
        <h1>{flow?.name || ''}</h1>
        <div className='flex items-center gap-5'>
          <ThemeToggle />
          <Button onClick={handleFlowRun} variant={'secondary'}>
            Download
            <Download />
          </Button>
          <Button onClick={handleFlowRun} disabled={isFlowRunning}>
            {isFlowRunning ? "Running" : "Run"}
            {isFlowRunning ? <Clock /> : <PlayIcon />}
          </Button>
        </div>
      </div>
      <div className='w-full h-full relative overflow-hidden'>
        {sidePanelComponent}

        <ReactFlowProvider>
          <div
            className="flex-1 h-full"
            ref={wrapperRef}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodesDelete={onNodesDelete}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              onMoveEnd={() => {
                setHasChanges(true);
              }}
              onEdgeMouseEnter={(e, edge) => handleEdgeMouseEnter(e, edge)}
              onEdgeMouseLeave={(e, edge) => handleEdgeMouseLeave(e, edge)}
              edgeTypes={edgeTypes}
            >
              <MiniMap />
              <Controls />
              <Background gap={12} size={1} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  )
}
