'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Upload, Trash2, Database } from 'lucide-react';
import { getUserStorage } from '@/app/lib/storage';

export default function DataManager() {
  const { user } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportResult, setExportResult] = useState<string>('');

  const handleExport = async () => {
    if (!user?.email) return;

    setIsExporting(true);
    try {
      const userId = user.email;
      const storage = getUserStorage(userId);

      if (storage) {
        const exportData = storage.exportData();

        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-master-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportResult('데이터가 성공적으로 내보내졌습니다!');
      }
    } catch (error) {
      setExportResult('데이터 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) return;

    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const userId = user.email;
      const storage = getUserStorage(userId);

      if (storage && storage.importData(text)) {
        alert('데이터가 성공적으로 가져와졌습니다! 페이지를 새로고침해주세요.');
        window.location.reload();
      } else {
        alert('잘못된 파일 형식입니다.');
      }
    } catch (error) {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleClearData = () => {
    if (!user?.email) return;

    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const userId = user.email;
      const storage = getUserStorage(userId);

      if (storage && storage.clearAllData()) {
        alert('모든 데이터가 삭제되었습니다. 페이지를 새로고침해주세요.');
        window.location.reload();
      } else {
        alert('데이터 삭제에 실패했습니다.');
      }
    }
  };
  const getDataSize = () => {
    if (!user?.email) return '0KB';

    const userId = user.email;
    const storage = getUserStorage(userId);

    if (storage) {
      const data = storage.exportData();
      const sizeInBytes = new Blob([data]).size;
      return sizeInBytes < 1024
        ? `${sizeInBytes}B`
        : `${Math.round((sizeInBytes / 1024) * 10) / 10}KB`;
    }

    return '0KB';
  };

  if (!user) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          데이터 관리
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>데이터 관리</DialogTitle>
        </DialogHeader>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              저장된 데이터 크기: <span className="font-mono">{getDataSize()}</span>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? '내보내는 중...' : '데이터 내보내기 (JSON)'}
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  disabled={isImporting}
                  className="w-full justify-start"
                  asChild
                >
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? '가져오는 중...' : '데이터 가져오기 (JSON)'}
                  </label>
                </Button>
              </div>

              <Button
                onClick={handleClearData}
                variant="destructive"
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                모든 데이터 삭제
              </Button>
            </div>

            {exportResult && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
                {exportResult}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 데이터는 브라우저 로컬 저장소에 저장됩니다</p>
              <p>• 정기적으로 백업을 권장합니다</p>
              <p>• 다른 기기에서 사용하려면 데이터를 내보내고 가져오세요</p>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
