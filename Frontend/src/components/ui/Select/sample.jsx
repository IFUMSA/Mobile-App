import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Select } from "./index";
import { ProfileSetupSelect } from "./profile-setup";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
];

export const SelectExample = () => {
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileCountry, setProfileCountry] = useState("");

  const styles = StyleSheet.create({
    container: {
      gap: 24,
    },
    section: {
      gap: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Regular Select Examples */}
      <View style={styles.section}>
        <ProfileSetupSelect
          label="Gender"
          icon="person"
          placeholder="Select your gender"
          value={profileGender}
          options={genderOptions}
          onValueChange={(option) => setProfileGender(option.value)}
        />

        <ProfileSetupSelect
          label="Country"
          icon="globe"
          placeholder="Select your country"
          value={profileCountry}
          options={countryOptions}
          onValueChange={(option) => setProfileCountry(option.value)}
        />
      </View>
      <View style={styles.section}>
        <Select
          label="Gender"
          placeholder="Select gender"
          value={gender}
          options={genderOptions}
          onValueChange={(option) => setGender(option.value)}
        />

        <Select
          label="Country"
          placeholder="Select country"
          value={country}
          options={countryOptions}
          onValueChange={(option) => setCountry(option.value)}
          required
          error={!country ? "Country is required" : undefined}
        />
      </View>
    </ScrollView>
  );
};
