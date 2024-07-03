using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class ChoiceGroup : MonoBehaviour
{
    public List<ChoiceBinding> Choices;
    public List<string> ParameterNames;
    public bool CanUnselect = true;
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
        ResetChoice();
    }

    public void ResetChoice()
    {
        SelectChoice((ChoiceBinding)null);
    }

    public void SelectChoice(ChoiceBinding newChoice)
    {
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
    }

    public void SelectChoice(string value)
    {
        ChoiceBinding oldChoice = selectedChoice;
        selectedChoice = Choices.FirstOrDefault(c => c.Values.FirstOrDefault(v => value.Contains(v, StringComparison.CurrentCultureIgnoreCase)) != null);
        if (selectedChoice != oldChoice)
        {
            Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        }
    }

}
