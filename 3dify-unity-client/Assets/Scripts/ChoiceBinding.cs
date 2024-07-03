using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class ChoiceBinding : MonoBehaviour
{
    public GameObject Target;
    public List<string> KeySuffix;
    public List<string> Values;

    public void OnChoiceChanged(ChoiceBinding selected)
    {
        Target.GetComponent<UIHandler>().ChangeImageColor(selected == this ? 0 : 1);
    }

    [ContextMenu ("Fix Suffixes")]
    void FixSuffixes()
    {
        KeySuffix = Enumerable.Repeat("", Values.Count).ToList();
        for(int i = 0; i < Values.Count; ++i)
        {
            string[] vals = Values[i].Split(" ");
            KeySuffix[i] = vals[0];
            Values[i] = string.Empty;
            for (int j = 1; j < vals.Length; ++j)
            {
                Values[i] += vals[j];
            }
        }
#if UNITY_EDITOR
        UnityEditor.SceneManagement.EditorSceneManager.MarkSceneDirty(UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene());
#endif
    }
}
