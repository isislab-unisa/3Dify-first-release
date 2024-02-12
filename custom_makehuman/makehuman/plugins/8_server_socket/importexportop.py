#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import pprint
import math
import numpy as np
import time
import log
import events3d
import tempfile

from .abstractop import AbstractOp
from core import G

pp = pprint.PrettyPrinter(indent=4)

mhapi = G.app.mhapi
human = mhapi.internals.getHuman()

class ImportExportOps(AbstractOp):

    def __init__(self, sockettaskview):
        super().__init__(sockettaskview)

        # Sync operations
        self.functions["loadMhm"] = self.loadMhm
        self.functions["exportFbx"] = self.exportFbx
        self.functions["applyModifiers"] = self.applyModifiers

    def loadMhm(self,conn,jsonCall):
        human.load("D:\\Downloads\\output (1).mhm", True)
        jsonCall.setData("OK")

    def exportFbx(self,conn,jsonCall):
        tmpDirName = tempfile.mkdtemp()
        mhapi.exports.exportAsFBX(os.path.join(tmpDirName, 'myHuman.fbx'), False)
        jsonCall.setData(tmpDirName)

    def applyModifiers(self, conn, jsonCall):
        for lh in list(G.app.loadHandlers.values()):
            lh(self, ['status', 'started'], True)

        event = events3d.HumanEvent(self, 'load')
        event.path = "aaa.mhm"
        human.callEvent('onChanging', event)
        human.resetMeshValues()
        for key, value in jsonCall.params.items():
            linedata = key.strip().split()
            linedata.append(value)
            if linedata[0] == 'modifier':
                modifier = self.api.internals.getHuman().getModifier(linedata[1])
                if not modifier:
                    jsonCall.setError("No such modifier")
                    return
                self.api.modifiers.applyModifier(linedata[1], float(value), True)
            elif linedata[0] in G.app.loadHandlers:
                G.app.loadHandlers[linedata[0]](human, linedata, False)

        for lh in set(G.app.loadHandlers.values()):
            lh(self, ['status', 'finished'], True)
        human.blockEthnicUpdates = False        
        human._setEthnicVals()
        human.callEvent('onChanged', event)
        human.applyAllTargets()
        jsonCall.setData("OK")