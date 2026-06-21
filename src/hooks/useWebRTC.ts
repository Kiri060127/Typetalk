'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socket'

interface CallState {
  isCalling: boolean
  isReceiving: boolean
  isInCall: boolean
  remoteUserId: string | null
  remoteUserName: string | null
  callDuration: number
}

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>({
    isCalling: false,
    isReceiving: false,
    isInCall: false,
    remoteUserId: null,
    remoteUserName: null,
    callDuration: 0,
  })

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const remoteStream = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const socket = useRef(getSocket())

  // 清理函数
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop())
      localStream.current = null
    }
    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }
    remoteStream.current = null
  }, [])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  // 创建 RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    pc.ontrack = (event) => {
      remoteStream.current = event.streams[0]
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit('ice_candidate', {
          candidate: event.candidate,
          to: callState.remoteUserId,
        })
      }
    }

    return pc
  }, [callState.remoteUserId])

  // 开始通话计时
  const startTimer = useCallback(() => {
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        callDuration: Math.floor((Date.now() - startTime) / 1000),
      }))
    }, 1000)
  }, [])

  // 发起通话
  const initiateCall = useCallback(async (userId: string, userName: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStream.current = stream

      const pc = createPeerConnection()
      peerConnection.current = pc

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.current.emit('call_offer', {
        offer,
        to: userId,
        fromName: userName,
      })

      setCallState({
        isCalling: true,
        isReceiving: false,
        isInCall: false,
        remoteUserId: userId,
        remoteUserName: userName,
        callDuration: 0,
      })
    } catch (error) {
      console.error('Failed to initiate call:', error)
      cleanup()
    }
  }, [createPeerConnection, cleanup])

  // 接受通话
  const acceptCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStream.current = stream

      const pc = createPeerConnection()
      peerConnection.current = pc

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      setCallState(prev => ({
        ...prev,
        isCalling: false,
        isReceiving: false,
        isInCall: true,
      }))

      startTimer()
    } catch (error) {
      console.error('Failed to accept call:', error)
      cleanup()
    }
  }, [createPeerConnection, startTimer, cleanup])

  // 处理远程 offer
  const handleRemoteOffer = useCallback(async (offer: RTCSessionDescriptionInit, fromUserId: string, fromName: string) => {
    try {
      setCallState({
        isCalling: false,
        isReceiving: true,
        isInCall: false,
        remoteUserId: fromUserId,
        remoteUserName: fromName,
        callDuration: 0,
      })

      // 等待用户接受后再创建 answer
      socket.current.once('call_accepted', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStream.current = stream

        const pc = createPeerConnection()
        peerConnection.current = pc

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream)
        })

        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.current.emit('call_answer', {
          answer,
          to: fromUserId,
        })

        setCallState(prev => ({
          ...prev,
          isReceiving: false,
          isInCall: true,
        }))

        startTimer()
      })
    } catch (error) {
      console.error('Failed to handle offer:', error)
      cleanup()
    }
  }, [createPeerConnection, startTimer, cleanup])

  // 结束通话
  const endCall = useCallback(() => {
    socket.current.emit('call_end', { to: callState.remoteUserId })
    cleanup()
    setCallState({
      isCalling: false,
      isReceiving: false,
      isInCall: false,
      remoteUserId: null,
      remoteUserName: null,
      callDuration: 0,
    })
  }, [callState.remoteUserId, cleanup])

  // 拒绝通话
  const rejectCall = useCallback(() => {
    socket.current.emit('call_reject', { to: callState.remoteUserId })
    cleanup()
    setCallState({
      isCalling: false,
      isReceiving: false,
      isInCall: false,
      remoteUserId: null,
      remoteUserName: null,
      callDuration: 0,
    })
  }, [callState.remoteUserId, cleanup])

  // 监听 Socket 事件
  useEffect(() => {
    const s = socket.current

    s.on('incoming_call', (data: { offer: RTCSessionDescriptionInit; from: string; fromName: string }) => {
      handleRemoteOffer(data.offer, data.from, data.fromName)
    })

    s.on('call_answered', async (data: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer))
        setCallState(prev => ({
          ...prev,
          isCalling: false,
          isInCall: true,
        }))
        startTimer()
      }
    })

    s.on('ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
    })

    s.on('call_ended', () => {
      cleanup()
      setCallState({
        isCalling: false,
        isReceiving: false,
        isInCall: false,
        remoteUserId: null,
        remoteUserName: null,
        callDuration: 0,
      })
    })

    s.on('call_rejected', () => {
      cleanup()
      setCallState({
        isCalling: false,
        isReceiving: false,
        isInCall: false,
        remoteUserId: null,
        remoteUserName: null,
        callDuration: 0,
      })
    })

    return () => {
      s.off('incoming_call')
      s.off('call_answered')
      s.off('ice_candidate')
      s.off('call_ended')
      s.off('call_rejected')
    }
  }, [handleRemoteOffer, startTimer, cleanup])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    callState,
    localStream: localStream.current,
    remoteStream: remoteStream.current,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    formatDuration,
  }
}
