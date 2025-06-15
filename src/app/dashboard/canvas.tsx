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
import InputNode from '../../components/nodes/inputNode';
import LLMNode from '../../components/nodes/llmNode';
import OutputNode from '../../components/nodes/outputNode';
import flowService from '@/services/flow';
import nodeService from '@/services/node';
import { Button } from '@/components/ui/button';
import { Clock, Download, PlayIcon } from 'lucide-react';
import { merge } from '@/lib/utils';
import { API_STREAM_EVENT_TYPE } from '@/types/common';
import Document from '../../components/nodes/documents';
import SidePanel, { SidePanelBody, SidePanelDescription, SidePanelTitle } from '@/components/ui/sidePanel';
import { Badge } from '@/components/ui/badge';
import LLMSidePanelBody from './sidePanels/llmSidePanelBody';
import InputSidePanelBody from './sidePanels/inputSidePanelBody';
import DocumentSidePanelBody, { FileUploadedType } from './sidePanels/documentSidePanelBody';
import ButtonEdge from '@/components/buttonEdge';

import { PDFDocument } from 'pdf-lib';
import docService from '@/services/docService';
import storage from '@/services/storage';

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export const Canvas = ({ flowID }: { flowID: string }) => {
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
    document: (props: NodeProps) => <Document {...props} key={props.id} flowID={flowID} updateSelf={updateSelf} handleOpenSidePanel={
      handleOnNodeClick
    } />,
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
    const { nodeID, data, runID } = eventData;
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
    await nodeService.runFlow(String(flowID), {
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
    flowService.getFlow(flowID).then(async (res) => {
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
      if (!hasChanges) return;

      try {
        const flow = {
          nodes: reactFlowInstance?.getNodes(),
          edges: reactFlowInstance?.getEdges(),
          viewport: reactFlowInstance?.getViewport(),
        };

        await flowService.saveFlow({ id: flowID, flow });
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

  const getNodeData = (type: string) => {
    switch (type) {
      case 'output': return {
        label: 'Output',
        nodeName: 'Output',
        description: `You'll find your application output here`
      };
      case 'start': return {
        label: 'Input',
        nodeName: 'Input',
        description: `This is entry point of your application, you can add your query here to test out the flow.`
      };
      case 'res': return {
        label: 'Output',
        nodeName: 'Output',
        description: 'You can visualize your output here'
      };
      case 'llm': return {
        label: 'LLM',
        nodeName: 'LLM',
        description: `Configure your Large Language Model (LLM)`
      };
      case 'document': return {
        label: 'Document',
        nodeName: 'Document',
        description: `Search through your uploaded document`
      };
      default: return {};
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

    const currTypeNodes = reactFlowInstance.getNodes().filter((n) => n.type === type);

    const newNode: Node = {
      id: `${id}-${currTypeNodes.length}`,
      type: type,
      position,
      data: getNodeData(type)
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

  async function getFileIdentifier(file: File, nodeID: string) {
    const fileIdentifier = await docService.getFileRefID({
      nodeID,
      flowID,
      fileName: file.name
    });
    if (!fileIdentifier) throw new Error("Could not process file");
    return fileIdentifier.id;
  }

  async function handleFileUpload(file: File, nodeID: string) {
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are supported.");
    }

    if (file.size <= maxSizeBytes) {
      console.log("File is a PDF but not larger than 5MB. No need to split.");
      const presignedURL = await storage.generateSequentialUploadSignedUrls({
        flowID,
        nodeID,
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
      flowID,
      nodeID,
      count: numberOfPresignedURLs,
      fileName: file.name
    });

    for await(const pageBlob of docService.yieldPDFPages(file)) {
      if (preSignedURLIndex === numberOfPresignedURLs - 1) {
        presignedURLs = await storage.generateSequentialUploadSignedUrls({
          flowID,
          nodeID,
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
      await handleFileUpload(file, nodeID);
      const res = await docService.completeUpload({
        nodeID,
        flowID,
        fileName: file.name
      });
      if (!res) throw new Error('Upload completion failed')
      return res;
    }
    catch (error) {
      console.debug('File upload failed', error);
      throw new Error("File upload failed");
    }
  }

  function getFileStatusFromRemoteFile(file: Record<string, any>) {
    if (file.processedAt) return 'successful';
    if (file.uploadedAt) return 'uploaded';
  }

  async function getRemoteFiles(nodeID: string): Promise<FileUploadedType[]> {
    const files = await docService.getFiles({
      nodeID,
      flowID
    })
    return files.map((file: Record<string, any>) => ({
      id: file.refID,
      fileName: file.fileName,
      fileExt: file.fileExt,
      size: file.size,
      filePath: file.path,
      status: getFileStatusFromRemoteFile(file) as 'uploading' | 'uploaded' | 'errored' | 'successful' | 'indexing'
    }));
  }

  const getDocumentSidePanelBody = (node: any) => {
    return <DocumentSidePanelBody 
      onFileSelected={(file: File) => onFileSelected(file, node.id)} 
      getFileIdentifier={(file: File) => getFileIdentifier(file, node.id)} 
      getRemoteFiles={() => getRemoteFiles(node.id)}
    />
  }

  const getLLMSidePanelBody = (node: any) => {
    return <LLMSidePanelBody nodeId={node.id} data={node.data} updateNode={updateNode} />
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
      case 'document': body = getDocumentSidePanelBody(sidePanelNode); break;
      case 'llm': body = getLLMSidePanelBody(sidePanelNode); break;
      case 'res': body = getResNodeSidePanelBody(sidePanelNode); break;
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
            ...edge, style: { stroke: 'blue' }, data: {
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
        <div className='flex items-center gap-2'>
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
