
import React, { useRef, useState } from 'react';
import { Save, Upload, Download, FileJson, Check, X, RefreshCw, Smartphone, Users } from 'lucide-react';
import { SaveData, SaveType } from '../../types/index';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: SaveType) => SaveData;
  onImport: (data: SaveData) => void;
}

const SaveLoadModal: React.FC<Props> = ({ isOpen, onClose, onExport, onImport }) => {
  const [activeTab, setActiveTab] = useState<'FULL' | 'ROSTER'>('FULL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>("");

  if (!isOpen) return null;

  // Helper to show temporary message
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- Handlers ---

  const handleBrowserSave = () => {
    try {
      const data = onExport('FULL');
      localStorage.setItem('hv_sim_autosave', JSON.stringify(data));
      showMessage("브라우저에 현재 상태가 저장되었습니다.");
    } catch (e) {
      alert("저장 공간이 부족하거나 오류가 발생했습니다.");
    }
  };

  const handleBrowserLoad = () => {
    try {
      const saved = localStorage.getItem('hv_sim_autosave');
      if (!saved) {
        alert("저장된 데이터가 없습니다.");
        return;
      }
      if (confirm("현재 진행 상황을 덮어쓰고 저장된 게임을 불러오시겠습니까?")) {
        const data = JSON.parse(saved) as SaveData;
        onImport(data);
        onClose();
      }
    } catch (e) {
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleFileDownload = (type: SaveType) => {
    const data = onExport(type);
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = type === 'FULL' 
      ? `HV_Save_Full_${dateStr}.json` 
      : `HV_Roster_${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage(type === 'FULL' ? "전체 게임 데이터가 다운로드되었습니다." : "캐릭터 명단이 다운로드되었습니다.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as SaveData;
        
        // Validation check based on active tab
        if (activeTab === 'FULL' && data.type !== 'FULL') {
          alert("이 파일은 '전체 저장' 데이터가 아닙니다. 캐릭터 명단 탭에서 불러와주세요.");
          return;
        }
        
        // Confirm message based on type
        const confirmMsg = data.type === 'ROSTER' 
          ? "캐릭터 명단을 불러와서 1일차부터 새 게임을 시작합니다. 계속하시겠습니까?" 
          : "저장된 게임 상태를 불러옵니다. 현재 진행 상황은 사라집니다. 계속하시겠습니까?";

        if (confirm(confirmMsg)) {
          onImport(data);
          onClose();
        }
      } catch (err) {
        alert("잘못된 파일 형식이거나 손상된 데이터입니다.");
      }
    };
    reader.readAsText(file);
    // Reset input to allow re-uploading same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#232323] w-full max-w-lg rounded-2xl border border-[#404040] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1c1c1c]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Save className="w-5 h-5 text-green-500" /> 데이터 관리
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333333]">
          <button 
            onClick={() => setActiveTab('FULL')}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'FULL' ? 'bg-[#2a2a2a] text-blue-400 border-b-2 border-blue-500' : 'bg-[#1c1c1c] text-gray-500 hover:text-gray-300'}`}
          >
            <Smartphone className="w-4 h-4" /> 전체 게임 저장
          </button>
          <button 
            onClick={() => setActiveTab('ROSTER')}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'ROSTER' ? 'bg-[#2a2a2a] text-purple-400 border-b-2 border-purple-500' : 'bg-[#1c1c1c] text-gray-500 hover:text-gray-300'}`}
          >
            <Users className="w-4 h-4" /> 캐릭터 명단 공유
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#2a2a2a]">
          
          {message && (
            <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-2 rounded text-center text-sm mb-4 animate-fade-in flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {message}
            </div>
          )}

          {activeTab === 'FULL' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#1c1c1c] rounded-xl border border-[#333] space-y-3">
                <h3 className="text-blue-300 font-bold text-sm">브라우저 간편 저장</h3>
                <p className="text-xs text-gray-500">
                  현재 기기의 브라우저에 임시로 저장합니다. 캐시를 지우면 사라질 수 있습니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleBrowserSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> 저장하기
                  </button>
                  <button 
                    onClick={handleBrowserLoad}
                    className="bg-[#333] hover:bg-[#444] text-gray-200 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-[#444]"
                  >
                    <RefreshCw className="w-4 h-4" /> 이어하기
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#1c1c1c] rounded-xl border border-[#333] space-y-3">
                <h3 className="text-gray-300 font-bold text-sm">파일로 백업 (.json)</h3>
                <p className="text-xs text-gray-500">
                  모든 진행 상황을 파일로 저장하여 안전하게 보관하거나 다른 기기로 옮깁니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleFileDownload('FULL')}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 파일 다운로드
                  </button>
                  <label className="bg-[#333] hover:bg-[#444] text-gray-200 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-[#444] cursor-pointer">
                    <Upload className="w-4 h-4" /> 파일 불러오기
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ROSTER' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1c1c1c] rounded-xl border border-[#333] space-y-3">
                <h3 className="text-purple-400 font-bold text-sm">캐릭터 명단만 추출/적용</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  현재 등록된 캐릭터들의 설정(이름, 능력, 관계 등)만 저장합니다.<br/>
                  <span className="text-yellow-500">주의: 명단을 불러오면 현재 진행 상황은 초기화되고 1일차부터 새 게임이 시작됩니다.</span>
                </p>
                
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleFileDownload('ROSTER')}
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> 캐릭터 명단 파일로 저장
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#333]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#1c1c1c] px-2 text-gray-500">OR</span>
                    </div>
                  </div>

                  <label className="w-full bg-[#333] hover:bg-[#444] text-purple-200 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-[#444] cursor-pointer">
                    <Upload className="w-4 h-4" /> 명단 파일 불러오기 (새 게임 시작)
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;
