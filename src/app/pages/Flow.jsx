import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, } from '@mui/material';

import Cookies from "js-cookie";
import environment from '@theflow/configs/environment';
import { FlowEditor, Sidebar } from '@theflow/components';
import { FlowService } from '@theflow/services/flow';
import { toast } from 'react-toastify';
import { Modal } from '@theflow/components/Modal';
import { ReactFlowProvider } from 'react-flow-renderer';
import { EditingNodesData } from '@theflow/components/EditingNodesData';
import { MESSAGE_TYPE } from '@theflow/constant';

Cookies.set(environment.COOKIES.SESSION, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNzEyOTY5MCwiZXhwIjoxNzM3NzM0NDkwfQ.78rRpq6rwcFPpX8BHfep2lFH_BEyBFzXhR1rwkRpc00");


export function Flow() {
  const { code } = useParams();
  const [savedNodes, setSavedNodes] = useState([]);
  const [savedEdges, setSavedEdges] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataNodes, setDataNodes] = useState(null);
  const [textMessage, setTextMessage] = useState(null);
  const [saveAnswer, setSaveAnswer] = useState(false);

  const [searching, setSearching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gptKey, setGptKey] = useState(null);


  const onEmojiClick = useCallback((event) => {
    setTextMessage((prevText) => prevText + event.emoji);
  }, []);

  const save = useCallback(async (data) => {
    if (data?.type === "add") {
      try {
        setSavedNodes((nds) => [
          ...nds,
          {
            id: data.id,
            positionX: data.position.x,
            positionY: data.position.y,
            textContent: null,
            type: data.item.type,
          },
        ]);
        const response = await FlowService.saveNodes(code, {
          id: data.id,
          type: data.item.type,
          position: {
            x: data.position.x,
            y: data.position.y,
          },
        });
        return response;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        return false;
      }
    }

    if (data?.type === "position") {
      try {
        const response = await FlowService.updateNodes(code, data.node.id, {
          position: {
            x: data.node.position.x,
            y: data.node.position.y,
          },
        });
        setSavedNodes((nds) =>
          nds.map((node) =>
            node.id === data.node.id
              ? {
                ...node,
                positionX: data.node.position.x,
                positionY: data.node.position.y,
              }
              : node
          )
        );
        return response;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        return false;
      }
    }

    if (data?.type === "remove") {
      try {
        const response = await FlowService.deleteNodes(code, data.node.id);
        if (response?.status === 200) {
          setSavedNodes((nds) => nds.filter((node) => node.id !== data.node.id));
          setSavedEdges((eds) => eds.filter((edge) => edge.source !== data.node.id && edge.target !== data.node.id));
        } else {
          toast.error(response.message || "Erro ao remover o nó");
        }
        return response;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        return false;
      }
    }

    if (data?.type === "connect") {
      try {
        setSavedEdges((nds) => [
          ...nds,
          {
            source: data.params.source,
            target: data.params.target,
          },
        ]);
        const response = await FlowService.connectEdges(code, data.params);
        return response;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        return false;
      }
    }

    if (data?.type === "deleteEdge") {
      try {
        setSavedEdges((edges) =>
          edges.filter(
            (edge) => edge.source !== data.source || edge.target !== data.target
          )
        );
        const response = await FlowService.deleteEdges(code, data?.source, data?.target);
        return response;
      } catch (error) {
        console.error(error);
        toast.error(error.message);
        return false;
      }
    }

    if (data?.type === "addConnection") {
      const _node = savedNodes.find((e) => e.id === data.sourceId);
      const _edges = savedEdges.filter((e => e.source === data.sourceId));
      const { positionX, positionY, id } = _node;
      save({
        id: data.id,
        textContent: null,
        type: 'add',
        item: {
          type: MESSAGE_TYPE.TEXT,
        },
        position: {
          x: positionX + 300,
          y: ((positionY) + (103 * _edges.length)),
        },
      });
      save({
        type: 'connect',
        params: {
          source: id,
          target: data.id,
        },
      });
    }

  }, [code, savedEdges, savedNodes]);


  const handleEdit = useCallback((event) => {
    setTextMessage(null);
    setDataNodes(null);
    setOpenModal(true);
    const node = savedNodes.find((e) => e.id === event.id);
    if (node) {
      console.log({ node })
      setTextMessage(node?.text_content);
      setDataNodes(node);
    }
  }, [savedNodes]);

  const onChangetextMessage = useCallback((event) => {
    setTextMessage(event.target.value);
  }, []);



  const saveText = useCallback(async () => {
    try {
      setSaving(true);
      const { id } = dataNodes;
      const { status, message } = await FlowService.updateContentNodes(code, id, {
        textContent: textMessage,
        saveAnswer: saveAnswer,
      });
      if (status === 200) {
        toast.success(message);
        const updatedNodes = savedNodes.map((node) =>
          node.id === id ? { ...node, textContent: textMessage, saveAnswer: saveAnswer } : node
        );
        setSavedNodes(updatedNodes);
      }
      setSaving(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  }, [code, dataNodes, saveAnswer, savedNodes, textMessage]);

  const uploadFileNodes = async (file) => {
    const { id } = dataNodes;
    const formData = new FormData();
    formData.append('file', file);
    const response = await FlowService.uploadFileNodes(code, id, formData);
    console.log(response)

  }

  const changeSaveAnswer = (event) => {
    setSaveAnswer(Boolean(event?.target?.checked))
  }


  const saveKeyGpt = async (key) => {
    const { status, message } = await FlowService.updateFlow(code, { key_gpt: key });
  }

  useEffect(() => {
    if (code) {
      setSearching(true);
      FlowService.fetchGetFlow(code).then(({ status, message, nodes, edges, api_key_gpt }) => {
        setSearching(false);
        if (status === 200) {
          setSavedEdges(edges);
          setSavedNodes(nodes);
          setGptKey(api_key_gpt);
          return;
        }
        toast.error(message);
      }).catch((e) => {
        toast.error(e.message);
      })
    }
  }, [code]);

  return (
    <Grid style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        key={code}
        saveKey={saveKeyGpt}
        gptKey={gptKey}
      />

      {!searching && (
        <ReactFlowProvider>
          <MemoizedFlowEditor
            code={code}
            nodes={savedNodes}
            edges={savedEdges}
            save={save}
            onEdit={handleEdit}
          />
        </ReactFlowProvider>
      )}


      <Modal title="Editar" open={openModal} onClose={() => { setOpenModal(false); }}>
        {dataNodes && (
          <EditingNodesData
            dataNodes={dataNodes}
            onUploadFileNodes={uploadFileNodes}
            onChangetextMessage={onChangetextMessage}
            onEmojiClick={onEmojiClick}
            textMessage={textMessage}
            saving={saving}
            saveText={saveText}
            onChangeSaveAnswer={changeSaveAnswer}
          />
        )}

      </Modal>
    </Grid>
  );
}

const MemoizedFlowEditor = React.memo(FlowEditor);
