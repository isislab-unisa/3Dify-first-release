using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using UnityEngine;

public class SlidersManager : MonoBehaviour
{
    public List<SliderBinding> Sliders;
    public List<ChoiceGroup> Choices;

    [ContextMenu("Get all binds")]
    void GetAllBinds()
    {
        Sliders = FindObjectsByType<SliderBinding>(FindObjectsInactive.Include, FindObjectsSortMode.None).ToList();
        Choices = FindObjectsByType<ChoiceGroup>(FindObjectsInactive.Include, FindObjectsSortMode.None).ToList();
#if UNITY_EDITOR
        UnityEditor.SceneManagement.EditorSceneManager.MarkAllScenesDirty();
#endif
    }

    public Dictionary<string, string> GetParametersFromSlidersAndChoices()
    {
        Dictionary<string, string> parameters = new Dictionary<string, string>();
        foreach (SliderBinding curSlider in Sliders)
        {
            parameters[curSlider.ParameterName] = curSlider.UiSlider.value.ToString();
        }

        foreach (ChoiceGroup curChoice in Choices)
        {
            if (curChoice.SelectedChoice != null)
            {
                for(int i = 0; i < curChoice.ParameterNames.Count; ++i)
                {
                    if (i >= curChoice.SelectedChoice.KeySuffix.Count || string.IsNullOrEmpty(curChoice.SelectedChoice.KeySuffix[i]))
                    {
                        parameters[curChoice.ParameterNames[i]] = curChoice.SelectedChoice.Values[i];
                    }
                    else
                    {
                        parameters[curChoice.ParameterNames[i] + " " + curChoice.SelectedChoice.KeySuffix[i]] = curChoice.SelectedChoice.Values[i];
                    }
                }
                
            }
        }
        return parameters;
    }
    
    public void ApplyParametersToSlidersAndChoices(Dictionary<string, string> parameters)
    {
        foreach (KeyValuePair<string, string> curParam in parameters)
        {
            SliderBinding slider = Sliders.FirstOrDefault(s => s.ParameterName == curParam.Key);
            if (slider != null)
            {
                float val;
                if (float.TryParse(curParam.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out val))
                {
                    slider.UiSlider.value = val;
                    continue;
                }
            }

            ChoiceGroup choice = Choices.FirstOrDefault(c => c.Choices.FirstOrDefault(ch => 
                ch.Values.Contains(curParam.Value))!= null);
            if (choice != null)
            {
                float val;
                if (float.TryParse(curParam.Value, NumberStyles.Any, CultureInfo.InvariantCulture, out val))
                {
                    choice.SelectChoice(val);
                }
                else
                {
                    choice.SelectChoice(curParam.Value);
                }
            }
        }
    }

}
