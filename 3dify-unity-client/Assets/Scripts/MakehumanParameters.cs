using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;

public class MakehumanParameters : MonoBehaviour
{
    public Dictionary<string, string> Parameters;

    public void FromJson(string json)
    {
        Parameters = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
    }

    public string ToJson()
    {
        return JsonConvert.SerializeObject(Parameters);
    }

    public void ChangeParameter(string modifier, string value)
    {
        Parameters[modifier] = value;
    }
}
