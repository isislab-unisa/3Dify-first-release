using System.Collections.Generic;
using UnityEngine;

public class ChoiceBinding : MonoBehaviour
{
    public GameObject Target;
    public List<string> Values;

    public void OnChoiceChanged(ChoiceBinding selected)
    {
        Target.GetComponent<UIHandler>().ChangeImageColor(selected == this ? 0 : 1);
    }
}
