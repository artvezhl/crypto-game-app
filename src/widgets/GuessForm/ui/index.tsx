import { Button, Input, useAppStore } from "../../../shared";
import { ChangeEventHandler, useState } from "react";
import { EButtonVariant } from "../../../shared/ui/Button";

type TFields = "guess" | "salt";

export const GuessForm = () => {
  const [enterGuess, isRevealPhase, isSubmissionPhase, revealSaltAndGuess] =
    useAppStore((state) => [
      state.enterGuess,
      state.isRevealPhase,
      state.isSubmissionPhase,
      state.revealSaltAndGuess,
    ]);
  const [formState, setFormState] = useState<{ [T in TFields]: number }>({
    guess: 0,
    salt: 0,
  });
  const [visibilityState, setVisibilityState] = useState<{
    [T in TFields]: boolean;
  }>({
    guess: false,
    salt: false,
  });

  const handleChangeValue: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value, id } = e.target;
    setFormState((prev) => ({ ...prev, [id]: +value }));
  };

  const handleVisibilityChange = (field: TFields) => {
    console.log("FIELD", field);
    setVisibilityState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        console.log("formState", formState);
        if (isRevealPhase()) await revealSaltAndGuess(formState);
        if (isSubmissionPhase()) await enterGuess(formState);
      }}
    >
      <div className="flex">
        <Input
          label="Your guess"
          id="guess"
          type={visibilityState.guess ? "number" : "password"}
          placeholder="Your guess"
          // disabled
          onChange={handleChangeValue}
        />
        <Button
          variant={EButtonVariant.ICON}
          type="button"
          onClick={() => handleVisibilityChange("guess")}
        >
          <i
            className={`fas ${
              !visibilityState.guess ? "fa-eye" : "fa-eye-slash"
            }`}
            id="toggleGuessVisibility"
          ></i>
        </Button>
      </div>
      <div className="flex">
        <Input
          label="Your salt"
          id="salt"
          type={visibilityState.salt ? "number" : "password"}
          placeholder="Your salt"
          // disabled
          onChange={handleChangeValue}
        />
        <Button
          variant={EButtonVariant.ICON}
          type="button"
          onClick={() => handleVisibilityChange("salt")}
        >
          <i
            className={`fas ${
              !visibilityState.salt ? "fa-eye" : "fa-eye-slash"
            }`}
            id="toggleGuessVisibility"
          ></i>
        </Button>
      </div>
      <Button type="submit">{`${
        isRevealPhase() ? "Reveal" : "Submit"
      } your guess`}</Button>
    </form>
  );
};
