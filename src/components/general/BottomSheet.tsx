import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
  onDismiss: () => void;
  startIndex?: number;
}

const BottomSheet = ({ children, onDismiss, startIndex = 0 }: BottomSheetProps, ref: React.Ref<BottomSheetModal>) => {
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <BottomSheetModal
      snapPoints={['60%', "80%"]}
      ref={ref}
      index={startIndex}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
    >
      <BottomSheetView>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default forwardRef(BottomSheet);