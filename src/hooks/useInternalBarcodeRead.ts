import { useCallback } from 'react';
import { PixelRatio, Platform } from 'react-native';
import { BarCodeType, Point, RNCamera, Size } from 'react-native-camera';

const useInternalBarcodeReadIOS = (
  barcodeRead: boolean,
  isFocused: boolean,
  finderX: number,
  finderY: number,
  finderWidth: number,
  finderHeight: number,
  processingReadBarcode: (data: string) => void
) =>
  useCallback(
    (event: {
      data: string;
      bounds:
        | { width: number; height: number; origin: Array<Point<string>> }
        | { origin: Point<string>; size: Size<string> };
      type: keyof BarCodeType;
    }) => {
      if (!isFocused || barcodeRead) {
        return;
      }

      const {
        origin: { x, y },
        size: { width, height },
      } = event.bounds as { origin: Point<string>; size: Size<string> };

      if (
        Number(x) >= finderX &&
        Number(x) + Number(width) <= finderX + finderWidth &&
        Number(y) >= finderY &&
        Number(y) + Number(height) <= finderY + finderHeight
      ) {
        return processingReadBarcode(event.data);
      }
    },
    [
      barcodeRead,
      isFocused,
      finderX,
      finderY,
      finderWidth,
      finderHeight,
      processingReadBarcode,
    ]
  );

const useInternalBarcodeReadAndroid = (
  barcodeRead: boolean,
  isFocused: boolean,
  finderX: number,
  finderY: number,
  finderWidth: number,
  finderHeight: number,
  processingReadBarcode: (data: string) => void
) =>
  useCallback(
    (event: {
      data: string;
      bounds:
        | { width: number; height: number; origin: Array<Point<string>> }
        | { origin: Point<string>; size: Size<string> };
      type: keyof BarCodeType;
    }) => {
      if (!isFocused || barcodeRead) {
        return;
      }

      const _bounds = event.bounds as {
        width: number;
        height: number;
        origin: Point<string>[];
      };
      const _pointBounds = _bounds.origin.map((point) => ({
        x: Number(point.x) / PixelRatio.get(),
        y: Number(point.y) / PixelRatio.get(),
      }));

      const _insideBox = (point: { x: number; y: number }) => {
        const { x, y } = point;
        return (
          x >= finderX &&
          x <= finderX + finderWidth &&
          y >= finderY &&
          y <= finderY + finderHeight
        );
      };

      const isInside = _pointBounds.every((p) => _insideBox(p));
      if (isInside) {
        processingReadBarcode(event.data);
        return;
      }
    },
    [
      barcodeRead,
      isFocused,
      finderX,
      finderY,
      finderWidth,
      finderHeight,
      processingReadBarcode,
    ]
  );

export default Platform.select({
  android: useInternalBarcodeReadAndroid,
  ios: useInternalBarcodeReadIOS,
}) as typeof useInternalBarcodeReadAndroid;
