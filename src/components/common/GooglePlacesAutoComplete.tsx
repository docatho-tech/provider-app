import useAxios from "@/hooks/useAxios";
import useDebounce from "@/hooks/useDebounce";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import BottomSheet from "../general/BottomSheet";
import Input from "../general/Input";

type Prediction = { description: string; place_id: string };

interface Props {
  show: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
  inputBoxStyleClass?: string;
  heading?: string;
}

interface PredictionResponse {
  status: string;
  predictions: Prediction[];
}

export default function PlacesAutocomplete({
  show,
  inputBoxStyleClass = "",
  heading = "",
  onClose,
  onSelect,
}: Props) {
  const headerHeight = useHeaderHeight();
  const [input, setInput] = useState("");
  const debounce = useDebounce();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const sessionToken = useRef(Math.random().toString(36).substr(2, 10));
  const {requestGET: getLocations} = useAxios<PredictionResponse>("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (show) {
      bottomSheetRef.current?.present();
    }
  }, [show])

  const fetchPredictions = async (text: string) => {
    setInput(text);
    if(!text.trim()) {
      setPredictions([]);
      return;
    }

    const queryset = {
      input: input,
      key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      sessiontoken: sessionToken.current,
      types: "geocode",
      language: "en",
    }

    debounce(async () => {  
      const response = await getLocations(queryset);
      if(response.data.status === "OK") {
        setPredictions(response.data.predictions);
      } else {
        setPredictions([]);
      }
    }, 1000);
  }

  const handleSelect = (pred: Prediction) => {
    setInput(pred.description);
    setPredictions([]);
    onSelect(pred.description);
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet ref={bottomSheetRef} onDismiss={onClose} startIndex={2}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: headerHeight - 20, android: 500 })}
      >
        <View className="w-full z-10 mb-4 mt-2 px-[10px]">
          {
            heading && (
              <Text className="text-primaryText font-semibold text-[18px]"> {heading} </Text>
            )
          }
          <Input 
            value={input}
            onChange={(text) => fetchPredictions(text)}
            inputClassName={inputBoxStyleClass}
            placeholder="Search address…"
          />
          {predictions.length > 0 && (
            <ScrollView className="max-h-[400px] mt-[10px] bg-white border border-gray-300 border-t-0 rounded">
              {predictions.map((p) => (
                <TouchableOpacity
                  key={p.place_id}
                  className="p-3 border-b border-gray-100"
                  onPress={() => handleSelect(p)}
                >
                  <Text>{p.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
