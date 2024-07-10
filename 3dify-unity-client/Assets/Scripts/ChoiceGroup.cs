using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using UnityEngine;
using UnityEngine.Events;

public class ChoiceGroup : MonoBehaviour
{
    public List<ChoiceBinding> Choices;
    public List<string> ParameterNames;
    public bool CanUnselect = true;
    public UnityEvent OnValueChangedFromGUI;
    private ChoiceBinding selectedChoice;

    public ChoiceBinding SelectedChoice
    {
        get
        {
            return selectedChoice;
        }
    }

    public void Start()
    {
        if(selectedChoice == null)
            ResetChoice();
    }

    public void ResetChoice()
    {
        SelectChoice((ChoiceBinding)null);
    }

    public void SelectChoice(ChoiceBinding newChoice)
    {
        ChoiceBinding oldChoice = selectedChoice;
        if (!CanUnselect)
        {
            if (newChoice != null)
            {
                selectedChoice = newChoice;
            }
            else
            {
                selectedChoice = Choices[0];
            }
        }
        else
        {
            if (selectedChoice != newChoice || newChoice == null)
            {
                selectedChoice = newChoice;
            }
            else
            {
                selectedChoice = null;
            }
        }
        Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        if(oldChoice != selectedChoice)
            OnValueChangedFromGUI.Invoke();
    }

    public void SelectChoice(float value)
    {
        ChoiceBinding oldChoice = selectedChoice;
        selectedChoice = Choices.FirstOrDefault(c => c.Values.FirstOrDefault(v => Mathf.Approximately(float.Parse(v, NumberStyles.Any, CultureInfo.InvariantCulture), value)) != null);
        if (selectedChoice != oldChoice)
        {
            Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        }
    }

    public void SelectChoice(string value)
    {
        ChoiceBinding oldChoice = selectedChoice;
        selectedChoice = Choices.FirstOrDefault(c => c.Values.FirstOrDefault(v => v.Contains(value, StringComparison.CurrentCultureIgnoreCase)) != null);
        if (selectedChoice != oldChoice)
        {
            Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        }
    }

}
