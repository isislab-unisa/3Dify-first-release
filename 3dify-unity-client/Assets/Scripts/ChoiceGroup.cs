using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class ChoiceGroup : MonoBehaviour
{
    public List<ChoiceBinding> Choices;
    public List<string> ParameterNames;
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
        SelectChoice((ChoiceBinding)null);
    }

    public void SelectChoice(ChoiceBinding newChoice)
    {
        if (selectedChoice != newChoice || newChoice == null)
        {
            selectedChoice = newChoice;
            Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        }
        else
        {
            selectedChoice = null;
        }
        Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
    }

    public void SelectChoice(string value)
    {
        ChoiceBinding oldChoice = selectedChoice;
        selectedChoice = Choices.FirstOrDefault(c => c.Values.FirstOrDefault(v => string.Equals(v, value, StringComparison.CurrentCultureIgnoreCase)) != null);
        if (selectedChoice != oldChoice)
        {
            Choices.ForEach(c => c.OnChoiceChanged(selectedChoice));
        }
    }

}
